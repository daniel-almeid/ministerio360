import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPagarme, post, resetState, state } from "./fakes";

vi.mock("@supabase/supabase-js", async () => {
    const { supabaseProxy } = await import("./fakes");
    return { createClient: () => supabaseProxy };
});
vi.mock("next/server", async () => (await import("./fakes")).nextServerMock);

process.env.PAGARME_SECRET_KEY = "sk_test_fake";
const { POST } = await import("@/app/api/pagarme/webhook/route");

const URL = "https://ministerio360.vercel.app/api/pagarme/webhook";
const evento = (type: string, data: unknown) => post(URL, { type, data });
const perfil = () => state.db.church_profiles[0];
const claims = () => state.calls.rpc.filter((c) => c.fn === "refresh_church_claim").map((c) => c.args.p_user_id);

beforeEach(() => {
    resetState({
        db: {
            church_profiles: [
                { id: "c1", user_id: "u-pastor", plan_slug: "premium", billing_cycle: "monthly", subscription_active: true, plan_expires_at: "2026-10-01T00:00:00Z", pagarme_subscription_id: "sub_1" },
            ],
            plans: [
                { plan_slug: "standard", pagarme_plan_id: "plan_std_m", pagarme_yearly_plan_id: "plan_std_y" },
                { plan_slug: "premium_basic", pagarme_plan_id: "plan_pb_m", pagarme_yearly_plan_id: "plan_pb_y" },
                { plan_slug: "premium", pagarme_plan_id: "plan_pp_m", pagarme_yearly_plan_id: "plan_pp_y" },
            ],
            church_users: [
                { user_id: "u-pastor", church_id: "c1" },
                { user_id: "u-tes", church_id: "c1" },
            ],
        },
    });
});

describe("Webhook do Pagar.me", () => {
    it("pagamento confirmado renova até o fim do ciclo e atualiza todos da igreja", async () => {
        mockPagarme({ "GET invoices/inv_1": () => ({ json: { status: "paid", subscription: { id: "sub_1" }, cycle: { end_at: "2026-11-21T02:59:59Z" } } }) });
        const r = await POST(evento("invoice.paid", { id: "inv_1" }));
        expect(r.status).toBe(200);
        expect(perfil().plan_expires_at).toBe("2026-11-21T02:59:59.000Z");
        expect(perfil().subscription_active).toBe(true);
        expect(new Set(claims())).toEqual(new Set(["u-pastor", "u-tes"]));
    });

    it("sem ciclo na fatura, usa o ciclo atual da assinatura", async () => {
        mockPagarme({
            "GET invoices/inv_1": () => ({ json: { status: "paid", subscription_id: "sub_1" } }),
            "GET subscriptions/sub_1": () => ({ json: { status: "active", current_cycle: { end_at: "2027-10-21T00:00:00Z" } } }),
        });
        await POST(evento("invoice.paid", { id: "inv_1" }));
        expect(perfil().plan_expires_at).toBe("2027-10-21T00:00:00.000Z");
    });

    it("sem nenhuma data, soma 1 ano no plano anual", async () => {
        state.db.church_profiles[0].billing_cycle = "yearly";
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
        try {
            mockPagarme({
                "GET invoices/inv_1": () => ({ json: { status: "paid", subscription: { id: "sub_1" } } }),
                "GET subscriptions/sub_1": () => ({ json: { status: "active" } }),
            });
            await POST(evento("invoice.paid", { id: "inv_1" }));
            expect(perfil().plan_expires_at).toBe("2027-10-21T12:00:00.000Z");
        } finally {
            vi.useRealTimers();
        }
    });

    it("aviso falso (o Pagar.me diz que não foi pago) não muda nada", async () => {
        mockPagarme({ "GET invoices/inv_1": () => ({ json: { status: "pending", subscription: { id: "sub_1" } } }) });
        await POST(evento("invoice.paid", { id: "inv_1" }));
        expect(state.calls.updates).toHaveLength(0);
        expect(perfil().plan_expires_at).toBe("2026-10-01T00:00:00Z");
    });

    it("fatura inexistente no Pagar.me não muda nada", async () => {
        mockPagarme({});
        await POST(evento("invoice.paid", { id: "inv_falsa" }));
        expect(state.calls.updates).toHaveLength(0);
    });

    it("cobrança recusada não bloqueia na hora (tolerância de 1 dia; o Pagar.me tenta de novo)", async () => {
        mockPagarme({ "GET invoices/inv_2": () => ({ json: { status: "failed", subscription: { id: "sub_1" } } }) });
        await POST(evento("invoice.payment_failed", { id: "inv_2" }));
        expect(perfil()).toMatchObject({ plan_slug: "premium", subscription_active: true, plan_expires_at: "2026-10-01T00:00:00Z" });
        expect(state.calls.updates).toHaveLength(0);
    });

    it("assinatura cancelada (confirmada na API) desativa; não confirmada, não", async () => {
        mockPagarme({ "GET subscriptions/sub_1": () => ({ json: { status: "active" } }) });
        await POST(evento("subscription.canceled", { id: "sub_1" }));
        expect(perfil().subscription_active).toBe(true);

        mockPagarme({ "GET subscriptions/sub_1": () => ({ json: { status: "canceled" } }) });
        await POST(evento("subscription.canceled", { id: "sub_1" }));
        expect(perfil().subscription_active).toBe(false);
    });

    it("cancelada com período pago pela frente: mantém o acesso até o fim e marca o cancelamento", async () => {
        Object.assign(state.db.church_profiles[0], { plan_expires_at: "2099-01-01T00:00:00Z", canceled_at: null });
        mockPagarme({ "GET subscriptions/sub_1": () => ({ json: { status: "canceled" } }) });
        await POST(evento("subscription.canceled", { id: "sub_1" }));
        expect(perfil()).toMatchObject({ subscription_active: true, plan_slug: "premium" });
        expect(perfil().canceled_at).toBeTruthy();
    });

    it("cancelamento de uma assinatura antiga (já trocada) não afeta a igreja", async () => {
        mockPagarme({ "GET subscriptions/sub_velha": () => ({ json: { status: "canceled" } }) });
        await POST(evento("subscription.canceled", { id: "sub_velha" }));
        expect(perfil().subscription_active).toBe(true);
    });

    it.each(["../orders/x", "sub_1?x=1", "a".repeat(80), 123, null])("id suspeito %s é ignorado sem chamar a API", async (id) => {
        const { calls } = mockPagarme({});
        const r = await POST(evento("subscription.canceled", { id }));
        expect(r.status).toBe(200);
        expect(calls).toHaveLength(0);
    });

    it("renovação paga depois que a rotina diária passou a igreja para o Grátis: devolve o plano", async () => {
        Object.assign(state.db.church_profiles[0], {
            plan_slug: "free", billing_cycle: "monthly", subscription_active: false, plan_expires_at: null,
        });
        mockPagarme({
            "GET invoices/inv_9": () => ({ json: { status: "paid", subscription: { id: "sub_1" }, cycle: { end_at: "2027-11-21T02:59:59Z" } } }),
            "GET subscriptions/sub_1": () => ({ json: { status: "active", plan: { id: "plan_pb_y" } } }),
        });
        await POST(evento("invoice.paid", { id: "inv_9" }));
        expect(perfil()).toMatchObject({
            plan_slug: "premium_basic",
            billing_cycle: "yearly",
            subscription_active: true,
            plan_expires_at: "2027-11-21T02:59:59.000Z",
        });
        expect(new Set(claims())).toEqual(new Set(["u-pastor", "u-tes"]));
    });

    it("sem o plano na assinatura, usa o plano gravado ao assinar (metadata)", async () => {
        state.db.church_profiles[0].plan_slug = "free";
        mockPagarme({
            "GET invoices/inv_9": () => ({ json: { status: "paid", subscription: { id: "sub_1" } } }),
            "GET subscriptions/sub_1": () => ({
                json: { status: "active", current_cycle: { end_at: "2026-12-21T02:59:59Z" }, metadata: { plan_slug: "standard", billing_cycle: "monthly" } },
            }),
        });
        await POST(evento("invoice.paid", { id: "inv_9" }));
        expect(perfil()).toMatchObject({ plan_slug: "standard", billing_cycle: "monthly", plan_expires_at: "2026-12-21T02:59:59.000Z" });
    });

    it("plano desconhecido no Pagar.me não muda o plano da igreja", async () => {
        mockPagarme({
            "GET invoices/inv_9": () => ({ json: { status: "paid", subscription: { id: "sub_1" }, cycle: { end_at: "2026-12-21T02:59:59Z" } } }),
            "GET subscriptions/sub_1": () => ({ json: { status: "active", plan: { id: "plan_estranho" }, metadata: { plan_slug: "diamante" } } }),
        });
        await POST(evento("invoice.paid", { id: "inv_9" }));
        expect(perfil()).toMatchObject({ plan_slug: "premium", billing_cycle: "monthly", subscription_active: true });
    });

    it("evento desconhecido ou sem tipo responde 200 e não faz nada", async () => {
        const { calls } = mockPagarme({});
        expect((await POST(evento("charge.created", { id: "ch_1" }))).status).toBe(200);
        expect((await POST(post(URL, {}))).status).toBe(200);
        expect(calls).toHaveLength(0);
        expect(state.calls.updates).toHaveLength(0);
    });
});
