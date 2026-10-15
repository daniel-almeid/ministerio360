"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast from "react-hot-toast";
import { generateFinancialPdf } from "../utils/generateFinancialPdf";

export function useTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterState, setFilterState] = useState("todas");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageChanging, setPageChanging] = useState(false);

    const [selectedMonthState, setSelectedMonthState] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [sessionLoaded, setSessionLoaded] = useState(false);

    const selectedMonthRef = useRef(selectedMonthState);
    const filterRef = useRef(filterState);

    const setSelectedMonth = (value: string) => {
        selectedMonthRef.current = value;
        setSelectedMonthState(value);
    };

    const setFilter = (value: string) => {
        filterRef.current = value;
        setFilterState(value);
    };

    useEffect(() => {
        function updateItemsPerPage() {
            setItemsPerPage(window.innerWidth < 768 ? 5 : 10);
        }

        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);

        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    async function loadTransactions(type = filterRef.current, monthYear = selectedMonthRef.current) {
        setLoading(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData?.session;

            if (!session) {
                setTransactions([]);
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

            if (type !== "todas") {
                query = query.eq("type", type);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Erro ao carregar transações:", error);
                toast.error("Erro ao carregar transações.");
                return;
            }

            setTransactions(data || []);
        } catch (err) {
            console.error("Erro inesperado ao carregar transações:", err);
            toast.error("Erro inesperado ao carregar transações.");
        } finally {
            setLoading(false);
            setCurrentPage(1);
        }
    }

    useEffect(() => {
        async function init() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) setSessionLoaded(true);
        }

        init();
    }, []);

    useEffect(() => {
        if (sessionLoaded) {
            loadTransactions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterState, selectedMonthState, sessionLoaded]);

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
            }, 400);
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

    async function exportPdf(churchName: string) {
        const monthYear = selectedMonthRef.current;
        const type = filterRef.current;

        const loadingToast = toast.loading("Gerando PDF...");

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const session = sessionData?.session;

            if (!session) {
                toast.error("Sessão expirada.", { id: loadingToast });
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

            if (type !== "todas") {
                query = query.eq("type", type);
            }

            const { data, error } = await query;

            if (error || !data) {
                toast.error("Erro ao gerar PDF.", { id: loadingToast });
                return;
            }

            generateFinancialPdf({
                churchName, 
                monthLabel: monthYear,
                transactions: data,
            });

            toast.success("PDF gerado com sucesso!", { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error("Erro inesperado ao gerar PDF.", { id: loadingToast });
        }
    }


    return {
        transactions,
        paginatedData,
        loading,
        pageChanging,
        filter: filterState,
        setFilter,
        selectedMonth: selectedMonthState,
        setSelectedMonth,
        totalPages,
        currentPage,
        handleNext,
        handlePrevious,
        confirmDelete,
        loadTransactions,
        exportPdf,
        itemsPerPage,
    };
}