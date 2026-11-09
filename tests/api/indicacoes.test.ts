import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPagarme, resetState, state } from "./fakes";

vi.mock("@supabase/supabase-js", async () => {
    const { supabaseProxy } = await import("./fakes");
    return { createClient: () => supabaseProxy };
});
vi.mock("next/server", async () => (await import("./fakes")).nextServerMock);

process.env.CRON_SECRET = "segredo-cron";
process.env.PAGARME_SECRET_KEY = "sk_test_fake";
process.env.REVENUECAT_SECRET_API_KEY = "sk_rc_fake";
const { GET } = await import("@/app/api/indicacoes/premios/route");

const URL = "https://ministerio360.vercel.app/api/indicacoes/premios";
const cron = (token = "segredo-cron") => new Request(URL, { headers: { authorization: `Bearer ${token}` } });

const igreja = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    user_id: `u-${id}`,
    plan_slug: "free",
    subscription_active: false,
    billing_provider: null,
    billing_cycle: null,
    pagarme_subscription_id: null,
    canceled_at: null,
    plan_expires_at: null,
    store_product_id: null,
    ...extra,
});
const pagando = { plan_slug: "standard", subscription_active: true, billing_cycle: "monthly", pagarme_subscription_id: "sub_nova" };

function cenario(referrer: Record<string, unknown>, referred: Record<string, unknown> = pagando) {
    resetState({
        db: {
            church_profiles: [igreja("quem-indicou", referrer), igreja("indicada", referred)],
            church_users: [],
            referrals: [{ id: "r1", referrer_church_id: "quem-indicou", referred_church_id: "indicada", status: "processando" }],
        },
        rpc: (fn) => (fn === "referral_claim_due" ? { data: state.db.referrals.filter((r) => r.status === "processando") } : {}),
    });
}
const indicacao = () => state.db.referrals[0];
const quemIndicou = () => state.db.church_profiles[0];

beforeEach(() => cenario({}));

describe("Rotina diária dos prêmios de indicação", () => {
    it("sem a senha da rotina: 401 e nada acontece", async () => {
        mockPagarme({});
        expect((await GET(new Request(URL))).status).toBe(401);
        expect((await GET(cron("errada"))).status).toBe(401);
        expect(state.calls.rpc).toHaveLength(0);
    });

    it("quem indicou está no Grátis: ganha 30 dias de Premium", async () => {
        mockPagarme({});
        const r = await GET(cron());
        expect(await r.json()).toMatchObject({ ok: true, processed: 1, results: { premiada: 1 } });
        expect(quemIndicou()).toMatchObject({ plan_slug: "premium_basic", subscription_active: true, billing_provider: "bonus" });
        expect(indicacao()).toMatchObject({ status: "premiada", reward_kind: "bonus_premium" });
        expect(state.calls.rpc.some((c) => c.fn === "refresh_church_claim" && c.args.p_user_id === "u-quem-indicou")).toBe(true);
    });

    it("quem indicou assina pelo site: próxima mensalidade grátis no Pagar.me", async () => {
        cenario({ ...pagando, pagarme_subscription_id: "sub_antiga" });
        const { calls } = mockPagarme({ "POST subscriptions/sub_antiga/discounts": () => ({ json: { id: "dis_1" } }) });
        await GET(cron());
        expect(calls[0].body).toEqual({ value: 100, discount_type: "percentage", cycles: 1 });
        expect(indicacao()).toMatchObject({ status: "premiada", reward_kind: "pagarme_desconto" });
    });

    it("quem indicou assina pela Google Play: adia 30 dias pelo RevenueCat", async () => {
        cenario({ plan_slug: "premium", subscription_active: true, billing_provider: "google_play", store_product_id: "ministerio360_premium:anual-12x" });
        const { calls } = mockPagarme({
            "POST https://api\\.revenuecat\\.com/v1/subscribers/quem-indicou/subscriptions/ministerio360_premium/defer": () => ({ json: {} }),
        });
        await GET(cron());
        expect(calls[0].body).toEqual({ extend_by_days: 30 });
        expect(indicacao()).toMatchObject({ status: "premiada", reward_kind: "loja_adiamento" });
    });

    it("a loja recusa (ex.: anual parcelado): fica pendente para resolver na mão", async () => {
        cenario({ plan_slug: "premium", subscription_active: true, billing_provider: "google_play", store_product_id: "ministerio360_premium:anual-12x" });
        mockPagarme({});
        const r = await GET(cron());
        expect(await r.json()).toMatchObject({ results: { pendente_manual: 1 } });
        expect(indicacao().status).toBe("pendente_manual");
        expect(indicacao().reward_note).toContain("404");
    });

    it("a indicada cancelou dentro dos 7 dias: não premia", async () => {
        cenario({}, { ...pagando, canceled_at: "2026-11-12T00:00:00Z" });
        mockPagarme({});
        await GET(cron());
        expect(indicacao().status).toBe("cancelada");
        expect(quemIndicou().plan_slug).toBe("free");
    });
});
