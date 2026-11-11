import { describe, expect, it } from "vitest";
import { inteiroPorExtenso, reaisPorExtenso } from "@/app/(protected)/financas/receipts/extenso";
import {
    buildReceiptHtml,
    buildStatementHtml,
    categoryLabel,
    receiptNumber,
    summarizeStatement,
} from "@/app/(protected)/financas/receipts/receiptHtml";

const IGREJA = {
    name: "Igreja Batista Esperança",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Flores, 100 — Nova Iguaçu/RJ",
    phone: null,
    email: "contato@esperanca.org",
};

describe("Valor por extenso", () => {
    it.each([
        [1, "um"],
        [10, "dez"],
        [16, "dezesseis"],
        [21, "vinte e um"],
        [100, "cem"],
        [101, "cento e um"],
        [250, "duzentos e cinquenta"],
        [1000, "mil"],
        [1001, "mil e um"],
        [1100, "mil e cem"],
        [1250, "mil duzentos e cinquenta"],
        [2000, "dois mil"],
        [21500, "vinte e um mil e quinhentos"],
        [1000000, "um milhão"],
        [2500000, "dois milhões e quinhentos mil"],
    ])("%i = %s", (n, texto) => {
        expect(inteiroPorExtenso(n)).toBe(texto);
    });

    it("em reais e centavos", () => {
        expect(reaisPorExtenso(150)).toBe("cento e cinquenta reais");
        expect(reaisPorExtenso(1)).toBe("um real");
        expect(reaisPorExtenso(0.5)).toBe("cinquenta centavos");
        expect(reaisPorExtenso(0.01)).toBe("um centavo");
        expect(reaisPorExtenso(1250.9)).toBe("mil duzentos e cinquenta reais e noventa centavos");
        expect(reaisPorExtenso(1000000)).toBe("um milhão de reais");
        expect(reaisPorExtenso(0.1 + 0.2)).toBe("trinta centavos"); // sem erro de arredondamento
    });
});

describe("Recibo de contribuição", () => {
    const html = buildReceiptHtml(
        IGREJA,
        { id: "a1b2c3d4-0000-1111-2222-333344445555", personName: "Maria <Silva>", category: "dizimo", amount: 350, date: "2026-11-05T15:00:00Z" },
        new Date(2026, 10, 9),
    );

    it("traz a igreja, o nome, o valor por extenso e o número", () => {
        expect(html).toContain("Igreja Batista Esperança");
        expect(html).toContain("CNPJ 12.345.678/0001-90");
        expect(html).toContain("Recibo de dízimo");
        expect(html).toContain("Nº A1B2C3D4");
        expect(html).toContain("trezentos e cinquenta reais");
        expect(html).toContain("05/11/2026");
        expect(html).toContain("9 de novembro de 2026");
    });

    it("não deixa o nome quebrar o documento", () => {
        expect(html).toContain("Maria &lt;Silva&gt;");
        expect(html).not.toContain("<Silva>");
    });

    it("nomes de categoria e número", () => {
        expect(categoryLabel("DÍZIMOS")).toBe("Dízimo");
        expect(categoryLabel("oferta")).toBe("Oferta");
        expect(categoryLabel("Missões")).toBe("Missões");
        expect(categoryLabel(null)).toBe("Contribuição");
        expect(receiptNumber("ab-cd-ef-12-34")).toBe("ABCDEF12");
    });
});

describe("Informe anual", () => {
    const itens = [
        { category: "Dízimo", amount: 300, date: "2026-01-10T15:00:00Z" },
        { category: "Oferta", amount: 50, date: "2026-01-20T15:00:00Z" },
        { category: "dizimo", amount: 300, date: "2026-02-10T15:00:00Z" },
        { category: "Missões", amount: 25.5, date: "2026-03-01T15:00:00Z" },
        { category: "Dízimo", amount: 999, date: "2025-12-10T15:00:00Z" }, // outro ano
    ];

    it("soma por mês e por tipo, só do ano escolhido", () => {
        const s = summarizeStatement(itens, 2026);
        expect(s.categories).toEqual(["Dízimo", "Oferta", "Missões"]);
        expect(s.months.map((m) => m.month)).toEqual([0, 1, 2]);
        expect(s.months[0].total).toBe(350);
        expect(s.totals["Dízimo"]).toBe(600);
        expect(s.total).toBe(675.5);
    });

    it("documento com total por extenso e aviso sobre o imposto de renda", () => {
        const html = buildStatementHtml(IGREJA, "Maria Silva", 2026, itens, new Date(2026, 10, 9));
        expect(html).toContain("Informe de contribuições 2026");
        expect(html).toContain("seiscentos e setenta e cinco reais e cinquenta centavos");
        expect(html).toContain("Janeiro");
        expect(html).not.toContain("Dezembro"); // dezembro de 2025 fica de fora
        expect(html).toContain("Doações Efetuadas");
    });
});
