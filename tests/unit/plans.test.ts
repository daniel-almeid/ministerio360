import { describe, expect, it } from "vitest";
import {
    PLANS,
    PLAN_LEVEL,
    PLAN_NAME,
    PLAN_SLUGS,
    formatBRL,
    getPlan,
    installmentLabel,
    isPlanSlug,
    monthlyEquivalent,
    planLevel,
    priceCents,
    priceLabel,
} from "@/lib/plans";

// Espaço normal ou "espaço fixo" (o Intl usa   entre R$ e o número)
const brl = (text: string) => text.replace(/ /g, " ");

describe("Catálogo de planos (site)", () => {
    it("tem os 4 planos na ordem da tela", () => {
        expect(PLANS.map((p) => p.slug)).toEqual(["free", "standard", "premium_basic", "premium"]);
        expect(PLAN_SLUGS).toEqual(["free", "standard", "premium_basic", "premium"]);
    });

    it("usa os preços combinados", () => {
        expect(getPlan("standard").monthlyCents).toBe(3990);
        expect(getPlan("premium_basic").monthlyCents).toBe(6990);
        expect(getPlan("premium").monthlyCents).toBe(9990);
        expect(getPlan("free").monthlyCents).toBe(0);
    });

    it("anual = 10 mensalidades (2 meses grátis) e parcela em até 12x", () => {
        for (const plan of PLANS.filter((p) => p.monthlyCents > 0)) {
            expect(plan.yearlyCents).toBe(plan.monthlyCents * 10);
            expect(plan.maxInstallments).toBe(12);
        }
    });

    it("limite de usuários igual ao do banco", () => {
        expect(getPlan("free").users).toBe(1);
        expect(getPlan("standard").users).toBe(3);
        expect(getPlan("premium_basic").users).toBe(5);
        expect(getPlan("premium").users).toBeNull();
    });

    it("o primeiro recurso de cada plano é o número de usuários", () => {
        expect(getPlan("free").features[0]).toBe("1 usuário");
        expect(getPlan("standard").features[0]).toBe("Até 3 usuários");
        expect(getPlan("premium_basic").features[0]).toBe("Até 5 usuários");
        expect(getPlan("premium").features[0]).toBe("Usuários ilimitados");
    });

    it("Premium e Premium+ liberam as mesmas telas; só o Premium+ tem suporte prioritário", () => {
        const telas = (slug: string) => getPlan(slug).features.slice(1).filter((f) => f !== "Suporte prioritário");
        expect(telas("premium_basic")).toEqual(telas("premium"));
        expect(getPlan("premium").features).toContain("Suporte prioritário");
        expect(getPlan("premium_basic").features).not.toContain("Suporte prioritário");
    });

    it("nomes exibidos", () => {
        expect(PLAN_NAME).toEqual({ free: "Grátis", standard: "Padrão", premium_basic: "Premium", premium: "Premium+" });
    });
});

describe("Níveis de acesso por plano", () => {
    it("Premium e Premium+ têm o mesmo nível; Padrão fica no meio", () => {
        expect(PLAN_LEVEL.premium_basic).toBe(PLAN_LEVEL.premium);
        expect(PLAN_LEVEL.standard).toBeGreaterThan(PLAN_LEVEL.free);
        expect(PLAN_LEVEL.premium).toBeGreaterThan(PLAN_LEVEL.standard);
    });

    it("plano desconhecido ou vazio vale como Grátis", () => {
        expect(planLevel("ouro")).toBe(1);
        expect(planLevel(undefined)).toBe(1);
        expect(planLevel(null)).toBe(1);
        expect(isPlanSlug("premium_basic")).toBe(true);
        expect(isPlanSlug("Premium")).toBe(false);
        expect(isPlanSlug(3)).toBe(false);
        expect(getPlan("qualquer").slug).toBe("free");
    });
});

describe("Preços na tela", () => {
    it("formata em reais", () => {
        expect(brl(formatBRL(3990))).toBe("R$ 39,90");
        expect(brl(formatBRL(99900))).toBe("R$ 999,00");
        expect(brl(formatBRL(123456))).toBe("R$ 1.234,56");
    });

    it("mostra /mês ou /ano conforme o ciclo", () => {
        const premium = getPlan("premium_basic");
        expect(brl(priceLabel(premium, "monthly"))).toBe("R$ 69,90/mês");
        expect(brl(priceLabel(premium, "yearly"))).toBe("R$ 699,00/ano");
        expect(priceCents(premium, "yearly")).toBe(69900);
        expect(priceLabel(getPlan("free"), "yearly")).toBe("R$ 0/mês");
    });

    it("mostra quanto o anual dá por mês", () => {
        expect(brl(monthlyEquivalent(getPlan("standard")))).toBe("equivale a R$ 33,25/mês");
        expect(brl(monthlyEquivalent(getPlan("premium_basic")))).toBe("equivale a R$ 58,25/mês");
        expect(brl(monthlyEquivalent(getPlan("premium")))).toBe("equivale a R$ 83,25/mês");
    });

    it("texto das parcelas", () => {
        expect(brl(installmentLabel(99900, 1))).toBe("À vista · R$ 999,00");
        expect(brl(installmentLabel(99900, 12))).toBe("12x de R$ 83,25");
        expect(brl(installmentLabel(39900, 3))).toBe("3x de R$ 133,00");
    });
});
