"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export type Member = {
    id: string;
    name: string;
    ministry_id: string | null;
    ministry_name?: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    birth_date: string | null;
};

const ITEMS_PER_PAGE = 10;

export function useMembersData() {
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    async function loadMembers() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("members")
                .select(`
                    id,
                    name,
                    email,
                    phone,
                    is_active,
                    birth_date,
                    ministry_id,
                    ministries ( name )
                `)
                .order("name", { ascending: true });

            if (error) {
                console.error("Erro ao carregar membros:", error);
                setMembers([]);
                return;
            }

            const mapped = (data || []).map((m: any) => ({
                ...m,
                ministry_name: m.ministries?.name || null,
                birth_date: m.birth_date
                    ? new Date(m.birth_date).toISOString().split("T")[0]
                    : null,
            }));

            setMembers(mapped);
        } catch (err) {
            console.error("Erro inesperado ao carregar membros:", err);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMembers();
        setCurrentPage(1);
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const result = members.filter((m) => {
            if (statusFilter === "active" && !m.is_active) return false;
            if (statusFilter === "inactive" && m.is_active) return false;
            if (!q) return true;
            const nome = m.name?.toLowerCase() || "";
            const ministerio = m.ministry_name?.toLowerCase() || "";
            return nome.includes(q) || ministerio.includes(q);
        });

        return result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    }, [members, search, statusFilter]);

    const totalPages = useMemo(() => Math.ceil(filtered.length / ITEMS_PER_PAGE), [filtered]);

    const paginatedMembers = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

    return {
        members,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        loading,
        setLoading,
        loadMembers,
        filtered,
        paginatedMembers,
        totalPages,
        currentPage,
        setCurrentPage,
        handlePrevious,
        handleNext,
    };
}
