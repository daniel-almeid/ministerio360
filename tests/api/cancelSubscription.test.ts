import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPagarme, post, resetState, state } from "./fakes";

vi.mock("@supabase/supabase-js", async () => {
    const { supabaseProxy } = await import("./fakes");
    return { createClient: () => supabaseProxy };
});
vi.mock("next/server", async () => (await import("./fakes")).nextServerMock);

process.env.PAGARME_SECRET_KEY = "sk_test_fake";
const { POST } = await import("@/app/api/pagarme/cancel-subscription/route");

const URL = "https://ministerio360.vercel.app/api/pagarme/cancel-subscription";
const ATE = "2026-11-21T02:59:59Z";
const logado = (token = "tok-pastor") => ({ authorization: `Bearer ${token}` });
const perfil = () => state.db.church_profiles[0];

beforeEach(() => {
    resetState({
        db: {
            church_users: [
                { user_id: "u-pastor", church_id: "c1", role: "pastor", status: "active" },
                { user_id: "u-tes", church_id: "c1", role: "tesoureiro", status: "active" },
            ],
            church_profiles: [
                { id: "c1", plan_slug: "premium_basic", subscription_active: true, pagarme_subscription_id: "sub_1", plan_expires_at: ATE, canceled_at: null },
            ],
        },
        sessions: {
            "tok-pastor": { id: "u-pastor", email: "pastor@igreja.com" },
            "tok-tes": { id: "u-tes", email: "tes@igreja.com" },
        },
    });
});

describe("Cancelar a renovação da assinatura", () => {
    it("cancela no Pagar.me e mantém o plano até o fim do período pago", async () => {
        const { calls } = mockPagarme({ "DELETE subscriptions/sub_1": () => ({ json: { status: "canceled" } }) });
        const r = await POST(post(URL, {}, logado()));
        expect(r.status).toBe(200);
        expect(await r.json()).toEqual({ success: true, access_until: ATE });
        expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual(["DELETE subscriptions/sub_1"]);
        expect(calls[0].body).toEqual({ cancel_pending_invoices: true });
        expect(perfil()).toMatchObject({ plan_slug: "premium_basic", subscription_active: true, plan_expires_at: ATE });
        expect(perfil().canceled_at).toBeTruthy();
    });

    it("sem login → 401; tesoureiro → 403 (e não chama o Pagar.me)", async () => {
        const { calls } = mockPagarme({});
        expect((await POST(post(URL, {}))).status).toBe(401);
        expect((await POST(post(URL, {}, logado("tok-falso")))).status).toBe(401);
        expect((await POST(post(URL, {}, logado("tok-tes")))).status).toBe(403);
        expect(calls).toHaveLength(0);
        expect(perfil().canceled_at).toBeNull();
    });

    it("plano sem renovação automática (Grátis ou liberado pelo admin) → 400", async () => {
        Object.assign(perfil(), { pagarme_subscription_id: null });
        mockPagarme({});
        const r = await POST(post(URL, {}, logado()));
        expect(r.status).toBe(400);
        expect((await r.json()).error).toMatch(/não tem uma assinatura/);
    });

    it("já cancelada: responde de novo sem chamar o Pagar.me", async () => {
        Object.assign(perfil(), { canceled_at: "2026-10-20T10:00:00Z" });
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, {}, logado()));
        expect(r.status).toBe(200);
        expect(calls).toHaveLength(0);
        expect(perfil().canceled_at).toBe("2026-10-20T10:00:00Z");
    });

    it("Pagar.me fora do ar: não marca como cancelada", async () => {
        mockPagarme({
            "DELETE subscriptions/sub_1": () => ({ status: 503, json: {} }),
            "GET subscriptions/sub_1": () => ({ status: 503, json: {} }),
        });
        const r = await POST(post(URL, {}, logado()));
        expect(r.status).toBe(502);
        expect(perfil().canceled_at).toBeNull();
    });

    it("assinatura que já estava cancelada no Pagar.me: marca e segue", async () => {
        mockPagarme({
            "DELETE subscriptions/sub_1": () => ({ status: 412, json: {} }),
            "GET subscriptions/sub_1": () => ({ json: { status: "canceled" } }),
        });
        expect((await POST(post(URL, {}, logado()))).status).toBe(200);
        expect(perfil().canceled_at).toBeTruthy();
    });
});
