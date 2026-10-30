import { describe, expect, it } from "vitest";
import { REASONS, lostFeatures, offerPrices, offerText, reasonAnswer } from "@/lib/retention";

// O preço vem com espaço especial (R$ 48,93); compara sem ele
const n = (s: string) => s.replace(/\s/g, " ");

describe("Retenção no cancelamento", () => {
    it("todo motivo tem resposta própria", () => {
        const titles = REASONS.map((r) => reasonAnswer(r.value).title);
        expect(new Set(titles).size).toBe(REASONS.length);
        expect(reasonAnswer("problemas").showSupport).toBe(true);
        expect(reasonAnswer("falta_recurso").askDetails).toBeTruthy();
        expect(reasonAnswer("nao_informado").title).toBe("Tudo bem");
    });

    it("lista o que a igreja perde ao voltar para o Grátis", () => {
        const premium = lostFeatures("premium");
        expect(premium[0]).toMatch(/Usuários ilimitados/);
        expect(premium).toContain("Cadastro de escalas");
        expect(premium).toContain("Suporte prioritário");
        expect(premium).not.toContain("Dashboard");
        expect(premium).not.toContain("Cadastro de membros");

        const padrao = lostFeatures("standard");
        expect(padrao[0]).toMatch(/Até 3 usuários/);
        expect(padrao).toContain("Cadastro de visitantes");
        expect(padrao).not.toContain("Relatórios simples");
    });

    it("texto e preço da oferta", () => {
        expect(offerText({ percent: 30, cycles: 3, billingCycle: "monthly" })).toBe("30% de desconto nas próximas 3 mensalidades");
        expect(offerText({ percent: 30, cycles: 1, billingCycle: "yearly" })).toBe("30% de desconto na próxima renovação anual");
        const p = offerPrices("premium_basic", { percent: 30, cycles: 3, billingCycle: "monthly" });
        expect([n(p.from), n(p.to), p.savedCents]).toEqual(["R$ 69,90/mês", "R$ 48,93/mês", 2097]);
        expect(n(offerPrices("premium", { percent: 30, cycles: 1, billingCycle: "yearly" }).to)).toBe("R$ 699,30/ano");
    });
});
