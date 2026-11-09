import { describe, expect, it } from "vitest";
import { chooseReward, isPaying, referredStillPaying, type ChurchRow } from "@/lib/referralRewards";

const NOW = new Date("2026-11-20T12:00:00Z");
const base: ChurchRow = {
    id: "c1",
    user_id: "u1",
    plan_slug: "free",
    subscription_active: false,
    billing_provider: null,
    billing_cycle: null,
    pagarme_subscription_id: null,
    canceled_at: null,
    plan_expires_at: null,
    store_product_id: null,
};

describe("Prêmio de quem indicou", () => {
    it("Grátis: 30 dias de Premium", () => {
        const r = chooseReward(base, NOW);
        expect(r.kind).toBe("bonus_premium");
        expect(r).toMatchObject({
            update: { plan_slug: "premium_basic", subscription_active: true, billing_provider: "bonus", plan_expires_at: "2026-12-20T12:00:00.000Z" },
        });
    });

    it("assina pelo site no mensal: próxima mensalidade grátis", () => {
        const r = chooseReward({ ...base, plan_slug: "standard", subscription_active: true, billing_cycle: "monthly", pagarme_subscription_id: "sub_1" }, NOW);
        expect(r).toMatchObject({ kind: "pagarme_desconto", subscriptionId: "sub_1", discount: { value: 100, discount_type: "percentage", cycles: 1 } });
    });

    it("assina pelo site no anual: desconto do valor de 1 mês", () => {
        const r = chooseReward({ ...base, plan_slug: "premium", subscription_active: true, billing_cycle: "yearly", pagarme_subscription_id: "sub_1" }, NOW);
        expect(r).toMatchObject({ kind: "pagarme_desconto", discount: { value: 9990, discount_type: "flat", cycles: 1 } });
    });

    it("assina pela Google Play: adia a renovação (código do produto sem o plano básico)", () => {
        const r = chooseReward(
            { ...base, plan_slug: "premium_basic", subscription_active: true, billing_provider: "google_play", store_product_id: "ministerio360_premium_basic:mensal" },
            NOW
        );
        expect(r).toMatchObject({ kind: "loja_adiamento", productId: "ministerio360_premium_basic" });
    });

    it("já está no mês grátis: soma mais 30 dias ao fim atual", () => {
        const r = chooseReward(
            { ...base, plan_slug: "premium_basic", subscription_active: true, billing_provider: "bonus", plan_expires_at: "2026-12-01T12:00:00.000Z" },
            NOW
        );
        expect(r).toMatchObject({ kind: "bonus_extensao", update: { plan_expires_at: "2026-12-31T12:00:00.000Z" } });
    });

    it("cancelou a renovação mas ainda tem período pago: +30 dias de acesso, sem cobrar", () => {
        const r = chooseReward(
            { ...base, plan_slug: "standard", subscription_active: true, pagarme_subscription_id: "sub_1", canceled_at: "2026-11-10T00:00:00Z", plan_expires_at: "2026-11-25T00:00:00.000Z" },
            NOW
        );
        expect(r).toMatchObject({ kind: "acesso_extensao", update: { plan_expires_at: "2026-12-25T00:00:00.000Z" } });
    });
});

describe("A indicada está pagando?", () => {
    it("cartão ou loja contam; bônus e plano dado pelo admin não", () => {
        expect(isPaying({ ...base, plan_slug: "standard", subscription_active: true, pagarme_subscription_id: "sub_1" })).toBe(true);
        expect(isPaying({ ...base, plan_slug: "standard", subscription_active: true, billing_provider: "google_play" })).toBe(true);
        expect(isPaying({ ...base, plan_slug: "premium_basic", subscription_active: true, billing_provider: "bonus" })).toBe(false);
        expect(isPaying({ ...base, plan_slug: "premium", subscription_active: true })).toBe(false);
    });

    it("cancelou dentro dos 7 dias: não premia", () => {
        expect(referredStillPaying({ ...base, plan_slug: "standard", subscription_active: true, pagarme_subscription_id: "sub_1", canceled_at: "2026-11-15T00:00:00Z" })).toBe(false);
    });
});
