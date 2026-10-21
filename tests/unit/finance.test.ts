import { describe, expect, it } from "vitest";
import { amountToInput, formatBRL, parseAmount } from "@/app/(protected)/financas/finance/money";
import {
    appliesToMonth,
    buildRecurringStatus,
    currentYearMonth,
    dueDateFor,
    monthStart,
} from "@/app/(protected)/financas/finance/recurring";
import type { RecurringExpense, RecurringPayment } from "@/app/(protected)/financas/finance/types";

describe("Dinheiro", () => {
    it("formata em reais sem depender do aparelho", () => {
        expect(formatBRL(0)).toBe("R$ 0,00");
        expect(formatBRL(1234.5)).toBe("R$ 1.234,50");
        expect(formatBRL(1234567.891)).toBe("R$ 1.234.567,89");
        expect(formatBRL(-50)).toBe("-R$ 50,00");
    });

    it("entende o valor digitado de vários jeitos", () => {
        expect(parseAmount("1.234,56")).toBe(1234.56);
        expect(parseAmount("1234,56")).toBe(1234.56);
        expect(parseAmount("1234.56")).toBe(1234.56);
        expect(parseAmount("R$ 50")).toBe(50);
        expect(parseAmount("R$ 1.000,00")).toBe(1000);
        expect(parseAmount("")).toBeNaN();
        expect(parseAmount("abc")).toBeNaN();
    });

    it("preenche o campo de valor", () => {
        expect(amountToInput(1234.5)).toBe("1234,50");
        expect(amountToInput(null)).toBe("");
        expect(amountToInput(undefined)).toBe("");
        expect(amountToInput(Number.NaN)).toBe("");
    });
});

const conta = (over: Partial<RecurringExpense> = {}): RecurringExpense => ({
    id: "r1",
    description: "Aluguel",
    category: "Aluguel",
    amount: 1000,
    day_of_month: 10,
    account_id: null,
    start_month: "2026-01-01",
    end_month: null,
    is_active: true,
    ...over,
});

describe("Despesas recorrentes", () => {
    it("datas do mês", () => {
        expect(monthStart("2026-10")).toBe("2026-10-01");
        expect(monthStart("2026-10-25")).toBe("2026-10-01");
        expect(currentYearMonth(new Date(2026, 0, 5))).toBe("2026-01");
    });

    it("vale só entre o início e o fim, e se estiver ativa", () => {
        expect(appliesToMonth(conta(), "2026-10")).toBe(true);
        expect(appliesToMonth(conta({ start_month: "2026-11-01" }), "2026-10")).toBe(false);
        expect(appliesToMonth(conta({ end_month: "2026-09-01" }), "2026-10")).toBe(false);
        expect(appliesToMonth(conta({ end_month: "2026-10-01" }), "2026-10")).toBe(true);
        expect(appliesToMonth(conta({ is_active: false }), "2026-10")).toBe(false);
    });

    it("vencimento no dia 31 vira o último dia em meses menores", () => {
        expect(dueDateFor(conta({ day_of_month: 31 }), "2026-02").getDate()).toBe(28);
        expect(dueDateFor(conta({ day_of_month: 31 }), "2028-02").getDate()).toBe(29);
        expect(dueDateFor(conta({ day_of_month: 31 }), "2026-04").getDate()).toBe(30);
        expect(dueDateFor(conta({ day_of_month: 5 }), "2026-10").getDate()).toBe(5);
    });

    it("situação: paga, atrasada, vence hoje, a vencer — pendentes primeiro", () => {
        const itens = [
            conta({ id: "paga", day_of_month: 1 }),
            conta({ id: "atrasada", day_of_month: 5 }),
            conta({ id: "hoje", day_of_month: 21 }),
            conta({ id: "futura", day_of_month: 28 }),
            conta({ id: "inativa", is_active: false }),
        ];
        const pagamentos: RecurringPayment[] = [{ id: "p1", recurring_id: "paga", amount: 1000, created_at: "2026-10-01" }];
        const status = buildRecurringStatus(itens, pagamentos, "2026-10", new Date(2026, 9, 21, 15, 0));

        expect(status.map((s) => [s.item.id, s.state])).toEqual([
            ["atrasada", "overdue"],
            ["hoje", "today"],
            ["futura", "upcoming"],
            ["paga", "paid"],
        ]);
        expect(status.find((s) => s.item.id === "paga")?.payment?.id).toBe("p1");
    });
});
