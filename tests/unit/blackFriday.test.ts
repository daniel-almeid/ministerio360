import { describe, expect, it } from "vitest";
import { formatBRL, getPlan } from "@/lib/plans";
import { pagarmeDiscount, promoActive, promoEligible, promoPriceCents, promoView } from "@/lib/promo";

describe("Black Friday 2026 (site)", () => {
    it("vale de 16/11 00:00 a 30/11 23:59 no horário de Brasília", () => {
        expect(promoActive(new Date("2026-11-15T23:59:59-03:00"))).toBe(false);
        expect(promoActive(new Date("2026-11-16T00:00:00-03:00"))).toBe(true);
        expect(promoActive(new Date("2026-11-30T23:59:59-03:00"))).toBe(true);
        expect(promoActive(new Date("2026-12-01T00:00:00-03:00"))).toBe(false);
    });

    it("só para quem nunca pagou um plano", () => {
        expect(promoEligible(null)).toBe(true); // conta nova
        expect(promoEligible({ billing_provider: null })).toBe(true); // plano Grátis
        expect(promoEligible({ billing_provider: "bonus" })).toBe(true); // mês grátis de indicação
        expect(promoEligible({ billing_provider: "pagarme", pagarme_subscription_id: "sub_1" })).toBe(false);
        expect(promoEligible({ billing_provider: null, pagarme_customer_id: "cus_1" })).toBe(false); // já pagou e cancelou
        expect(promoEligible({ billing_provider: "google_play" })).toBe(false);
    });

    it("anual 30% off e mensal 50% off só no 1º mês", () => {
        const premium = getPlan("premium_basic");
        expect(promoPriceCents(premium, "yearly")).toBe(48930);
        expect(promoPriceCents(premium, "monthly")).toBe(3495);
        expect(pagarmeDiscount("yearly")).toMatchObject({ value: 30, discount_type: "percentage", cycles: 1 });
        expect(pagarmeDiscount("monthly")).toMatchObject({ value: 50, discount_type: "percentage", cycles: 1 });
    });

    it("texto da tela", () => {
        const v = promoView(getPlan("standard"), "monthly", formatBRL);
        expect(v.label).toBe(`${formatBRL(1995)} no 1º mês`);
        expect(v.fullLabel).toBe(`${formatBRL(3990)}/mês`);
        expect(v.note).toContain(`Depois, ${formatBRL(3990)}/mês`);
    });
});
