"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export function useTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("todas");
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [sessionLoaded, setSessionLoaded] = useState(false);

    async function loadTransactions(type = filter, monthYear = selectedMonth) {
        setLoading(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData?.session;
            if (!session) {
                setTransactions([]);
                setLoading(false);
                return;
            }

            const [year, month] = monthYear.split("-");
            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

            let query = supabase
                .from("transactions")
                .select("*")
                .gte("created_at", start.toISOString())
                .lte("created_at", end.toISOString())
                .order("created_at", { ascending: false });

            if (type !== "todas") query = query.eq("type", type);

            const { data, error } = await query;

            if (error) {
                console.error("Erro ao carregar transações:", error);
            } else {
                setTransactions(data || []);
            }
        } catch (err) {
            console.error("Erro inesperado ao carregar transações:", err);
        } finally {
            setLoading(false);
            setCurrentPage(1);
        }
    }

    async function confirmDelete(id: string) {
        const loadingToast = toast.loading("Excluindo transação...");
        try {
            const { error } = await supabase.from("transactions").delete().eq("id", id);
            if (error) throw error;
            toast.success("Transação excluída com sucesso!", { id: loadingToast });
            loadTransactions();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir a transação.", { id: loadingToast });
        }
    }

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setSessionLoaded(true);
        }
        init();
    }, []);

    useEffect(() => {
        if (sessionLoaded) loadTransactions();
    }, [filter, selectedMonth, sessionLoaded]);

    const totalPages = useMemo(
        () => Math.ceil(transactions.length / ITEMS_PER_PAGE),
        [transactions]
    );

    const paginatedData = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        return transactions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [transactions, currentPage]);

    const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

    return {
        transactions,
        loading,
        filter,
        setFilter,
        selectedMonth,
        setSelectedMonth,
        paginatedData,
        totalPages,
        currentPage,
        handleNext,
        handlePrevious,
        loadTransactions,
        confirmDelete,
    };
}
