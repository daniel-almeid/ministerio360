"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFinancialReport() {
    const [financialData, setFinancialData] = useState<any[]>([]);
    const [loadingFinancial, setLoadingFinancial] = useState(true);

    async function loadFinancialReport(month: string) {
        setLoadingFinancial(true);

        const [year, monthNum] = month.split("-");
        const start = new Date(Number(year), Number(monthNum) - 1, 1);
        const end = new Date(Number(year), Number(monthNum), 0, 23, 59, 59);

        const { data, error } = await supabase
            .from("transactions")
            .select("category, type, amount, created_at")
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString());

        if (error) {
            console.error("Erro ao carregar dados financeiros:", error);
            setFinancialData([]);
            setLoadingFinancial(false);
            return;
        }

        const grouped: Record<string, { income: number; expense: number }> = {};

        data?.forEach((t) => {
            const category = t.category || "Sem categoria";

            if (!grouped[category]) {
                grouped[category] = { income: 0, expense: 0 };
            }

            if (t.type === "entrada") grouped[category].income += Number(t.amount);
            if (t.type === "saida") grouped[category].expense += Number(t.amount);
        });

        const result = Object.entries(grouped).map(([category, values]) => ({
            category,
            income: values.income,
            expense: values.expense,
            balance: values.income - values.expense,
        }));

        setFinancialData(result);
        setLoadingFinancial(false);
    }

    return { financialData, loadingFinancial, loadFinancialReport };
}
