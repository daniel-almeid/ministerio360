"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast from "react-hot-toast";

export function useTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("todas");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageChanging, setPageChanging] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [sessionLoaded, setSessionLoaded] = useState(false);

    // Detecta mobile x desktop
    useEffect(() => {
        function updateItemsPerPage() {
            if (window.innerWidth < 768) {
                setItemsPerPage(5);
            } else {
                setItemsPerPage(10);
            }
        }

        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);

        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

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
        () => Math.ceil(transactions.length / itemsPerPage),
        [transactions, itemsPerPage]
    );

    const paginatedData = useMemo(() => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        return transactions.slice(startIdx, startIdx + itemsPerPage);
    }, [transactions, currentPage, itemsPerPage]);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setPageChanging(true);
            setTimeout(() => {
                setCurrentPage((p) => p - 1);
                setPageChanging(false);
            }, 400); // tempo do loading
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setPageChanging(true);
            setTimeout(() => {
                setCurrentPage((p) => p + 1);
                setPageChanging(false);
            }, 400);
        }
    };

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

    return {
        transactions,
        loading,
        pageChanging,
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
        itemsPerPage
    };
}