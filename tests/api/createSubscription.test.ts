import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPagarme, post, resetState, state } from "./fakes";

vi.mock("@supabase/supabase-js", async () => {
    const { supabaseProxy } = await import("./fakes");
    return { createClient: () => supabaseProxy };
});
vi.mock("next/server", async () => (await import("./fakes")).nextServerMock);

process.env.PAGARME_SECRET_KEY = "sk_test_fake";
const { POST } = await import("@/app/api/pagarme/create-subscription/route");

const URL = "https://ministerio360.vercel.app/api/pagarme/create-subscription";
const FIM_DO_CICLO = "2026-11-21T02:59:59Z";

const corpo = (over: Record<string, unknown> = {}) => ({
    plan_slug: "premium_basic",
    billing_cycle: "monthly",
    installments: 1,
    card_token: "card_tok",
    email: "qualquer@x.com",
    name: "Igreja Central",
    document: "123.456.789-09",
    phone: { area_code: "11", number: "999999999" },
    address: { line_1: "Rua 1, 10", zip_code: "01001-000", city: "São Paulo", state: "SP" },
    ...over,
});

const logado = (token = "tok-pastor") => ({ authorization: `Bearer ${token}` });

function cenario(perfil: Record<string, unknown> = {}) {
    resetState({
        db: {
            plans: [
                { plan_slug: "standard", pagarme_plan_id: "plan_std_m", pagarme_yearly_plan_id: "plan_std_y", yearly_max_installments: 12, active: true },
                { plan_slug: "premium_basic", pagarme_plan_id: "plan_pb_m", pagarme_yearly_plan_id: "plan_pb_y", yearly_max_installments: 12, active: true },
                { plan_slug: "premium", pagarme_plan_id: "plan_pp_m", pagarme_yearly_plan_id: null, yearly_max_installments: 1, active: true },
            ],
            church_users: [
                { user_id: "u-pastor", church_id: "c1", role: "pastor", status: "active" },
                { user_id: "u-tes", church_id: "c1", role: "tesoureiro", status: "active" },
                { user_id: "u-pausado", church_id: "c1", role: "pastor", status: "paused" },
            ],
            church_profiles: [
                { id: "c1", user_id: "u-pastor", plan_slug: "free", subscription_active: false, pagarme_subscription_id: null, canceled_at: "2026-01-01T00:00:00Z", ...perfil },
            ],
        },
        sessions: {
            "tok-pastor": { id: "u-pastor", email: "pastor@igreja.com" },
            "tok-tes": { id: "u-tes", email: "tes@igreja.com" },
            "tok-pausado": { id: "u-pausado", email: "p2@igreja.com" },
        },
        users: [{ id: "u-pastor", email: "pastor@igreja.com" }],
    });
}

function pagarmeOk(status = "active", cycle: unknown = { end_at: FIM_DO_CICLO }) {
    return mockPagarme({
        "POST subscriptions": () => ({ json: { id: "sub_nova", status, customer: { id: "cus_1" }, current_cycle: cycle } }),
        "DELETE subscriptions/.+": () => ({ json: { status: "canceled" } }),
    });
}

const perfil = () => state.db.church_profiles[0];
const json = (r: Response) => r.json();

beforeEach(() => cenario());

describe("Assinatura: validações", () => {
    it.each([
        [{ plan_slug: "free" }, 400, "Plano inválido"],
        [{ plan_slug: "ouro" }, 400, "Plano inválido"],
        [{ billing_cycle: "weekly" }, 400, "Ciclo inválido"],
        [{ card_token: "" }, 400, "Dados incompletos"],
        [{ document: "" }, 400, "Dados incompletos"],
    ])("%o → %i", async (over, status, msg) => {
        const { calls } = pagarmeOk();
        const r = await POST(post(URL, corpo(over), logado()));
        expect(r.status).toBe(status);
        expect((await json(r)).error).toBe(msg);
        expect(calls).toHaveLength(0); // não chegou a falar com o Pagar.me
    });

    it("plano sem cobrança anual configurada é recusado", async () => {
        pagarmeOk();
        const r = await POST(post(URL, corpo({ plan_slug: "premium", billing_cycle: "yearly" }), logado()));
        expect(r.status).toBe(404);
    });

    it("plano desativado é recusado", async () => {
        state.db.plans[1].active = false;
        pagarmeOk();
        const r = await POST(post(URL, corpo(), logado()));
        expect(r.status).toBe(404);
    });

    it("sem endereço do cartão é recusado", async () => {
        const { calls } = pagarmeOk();
        const r = await POST(post(URL, corpo({ address: null }), logado()));
        expect(r.status).toBe(400);
        expect(calls).toHaveLength(0);
    });
});

describe("Assinatura: quem pode assinar", () => {
    it("login inválido → 401", async () => {
        pagarmeOk();
        const r = await POST(post(URL, corpo(), logado("tok-falso")));
        expect(r.status).toBe(401);
    });

    it("tesoureiro não assina → 403", async () => {
        const { calls } = pagarmeOk();
        const r = await POST(post(URL, corpo(), logado("tok-tes")));
        expect(r.status).toBe(403);
        expect(calls).toHaveLength(0);
    });

    it("Pastor pausado não assina → 403", async () => {
        pagarmeOk();
        const r = await POST(post(URL, corpo(), logado("tok-pausado")));
        expect(r.status).toBe(403);
    });
});

describe("Assinatura: mensal e anual", () => {
    it("mensal: plano mensal do Pagar.me, à vista, e-mail de quem está logado", async () => {
        const { calls } = pagarmeOk();
        const r = await POST(post(URL, corpo({ installments: 12 }), logado()));
        expect(r.status).toBe(200);
        expect(await json(r)).toEqual({ success: true, subscription_id: "sub_nova" });

        const enviado = calls.find((c) => c.method === "POST")!.body;
        expect(enviado.plan_id).toBe("plan_pb_m");
        expect(enviado.installments).toBe(1); // mensal nunca parcela
        expect(enviado.customer.email).toBe("pastor@igreja.com"); // ignora o e-mail do formulário
        expect(enviado.customer.document).toBe("12345678909");
        expect(enviado.card.billing_address.zip_code).toBe("01001000");
        expect(enviado.metadata).toEqual({ church_id: "c1", plan_slug: "premium_basic", billing_cycle: "monthly" });

        expect(perfil()).toMatchObject({
            plan_slug: "premium_basic",
            billing_cycle: "monthly",
            subscription_active: true,
            pagarme_subscription_id: "sub_nova",
            pagarme_customer_id: "cus_1",
            plan_expires_at: new Date(FIM_DO_CICLO).toISOString(),
            canceled_at: null,
        });
    });

    it("anual: plano anual e parcelas pedidas", async () => {
        const { calls } = pagarmeOk();
        await POST(post(URL, corpo({ billing_cycle: "yearly", installments: 10 }), logado()));
        const enviado = calls.find((c) => c.method === "POST")!.body;
        expect(enviado.plan_id).toBe("plan_pb_y");
        expect(enviado.installments).toBe(10);
        expect(perfil().billing_cycle).toBe("yearly");
    });

    it.each([
        [99, 12],
        [0, 1],
        [-3, 1],
        ["abc", 1],
        [3.7, 3],
    ])("parcelas %s viram %i", async (pedido, esperado) => {
        const { calls } = pagarmeOk();
        await POST(post(URL, corpo({ billing_cycle: "yearly", installments: pedido }), logado()));
        expect(calls.find((c) => c.method === "POST")!.body.installments).toBe(esperado);
    });

    it("sem a data do ciclo, a validade é 30 dias (mensal) ou 1 ano (anual)", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
        try {
            pagarmeOk("active", null);
            await POST(post(URL, corpo(), logado()));
            expect(perfil().plan_expires_at).toBe("2026-11-20T12:00:00.000Z");

            cenario();
            pagarmeOk("active", null);
            await POST(post(URL, corpo({ billing_cycle: "yearly" }), logado()));
            expect(perfil().plan_expires_at).toBe("2027-10-21T12:00:00.000Z");
        } finally {
            vi.useRealTimers();
        }
    });

    it("atualiza o acesso de todos os usuários da igreja", async () => {
        pagarmeOk();
        await POST(post(URL, corpo(), logado()));
        const atualizados = state.calls.rpc.filter((c) => c.fn === "refresh_church_claim").map((c) => c.args.p_user_id);
        expect(new Set(atualizados)).toEqual(new Set(["u-pastor", "u-tes", "u-pausado"]));
    });
});

describe("Assinatura: troca de plano e falhas", () => {
    it("trocar de plano cancela a assinatura anterior (sem cobrar duas vezes)", async () => {
        cenario({ plan_slug: "standard", subscription_active: true, pagarme_subscription_id: "sub_antiga" });
        const { calls } = pagarmeOk();
        await POST(post(URL, corpo(), logado()));
        const cancelamento = calls.find((c) => c.method === "DELETE");
        expect(cancelamento?.path).toBe("subscriptions/sub_antiga");
        expect(cancelamento?.body).toEqual({ cancel_pending_invoices: true });
        expect(perfil().pagarme_subscription_id).toBe("sub_nova");
    });

    it("primeira assinatura não cancela nada", async () => {
        const { calls } = pagarmeOk();
        await POST(post(URL, corpo(), logado()));
        expect(calls.filter((c) => c.method === "DELETE")).toHaveLength(0);
    });

    it("cartão recusado: cancela a tentativa e não libera o plano", async () => {
        cenario({ plan_slug: "standard", subscription_active: true, pagarme_subscription_id: "sub_antiga" });
        const { calls } = pagarmeOk("failed");
        const r = await POST(post(URL, corpo(), logado()));
        expect(r.status).toBe(402);
        expect((await json(r)).error).toMatch(/recusado/);
        expect(calls.filter((c) => c.method === "DELETE").map((c) => c.path)).toEqual(["subscriptions/sub_nova"]);
        expect(perfil()).toMatchObject({ plan_slug: "standard", pagarme_subscription_id: "sub_antiga" });
    });

    it("erro do Pagar.me: mostra a mensagem e não mexe no plano", async () => {
        mockPagarme({ "POST subscriptions": () => ({ status: 422, json: { message: "Cartão expirado" } }) });
        const r = await POST(post(URL, corpo(), logado()));
        expect(r.status).toBe(500);
        expect((await json(r)).error).toBe("Cartão expirado");
        expect(perfil().plan_slug).toBe("free");
        expect(state.calls.updates).toHaveLength(0);
    });
});

describe("Assinatura no cadastro (ainda sem login)", () => {
    it("acha a conta pelo e-mail, mesmo depois de mil contas", async () => {
        state.users = [
            ...Array.from({ length: 1000 }, (_, i) => ({ id: `outro-${i}`, email: `pessoa${i}@x.com` })),
            { id: "u-pastor", email: "Pastor@Igreja.com" },
        ];
        const { calls } = pagarmeOk();
        const r = await POST(post(URL, corpo({ email: "pastor@igreja.com" })));
        expect(r.status).toBe(200);
        expect(calls.find((c) => c.method === "POST")!.body.customer.email).toBe("pastor@igreja.com");
        expect(perfil().subscription_active).toBe(true);
    });

    it("igreja que já tem assinatura ativa precisa entrar no sistema para trocar", async () => {
        cenario({ plan_slug: "standard", subscription_active: true, pagarme_subscription_id: "sub_antiga" });
        const { calls } = pagarmeOk();
        const r = await POST(post(URL, corpo({ email: "pastor@igreja.com" })));
        expect(r.status).toBe(409);
        expect(calls).toHaveLength(0);
    });

    it("e-mail sem conta → 404", async () => {
        pagarmeOk();
        const r = await POST(post(URL, corpo({ email: "ninguem@x.com" })));
        expect(r.status).toBe(404);
    });

    it("sem login e sem e-mail → 400", async () => {
        pagarmeOk();
        const r = await POST(post(URL, corpo({ email: undefined })));
        expect(r.status).toBe(400);
    });
});
