"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { generateMembersPdf } from "../utils/generateMembersPdf";
import { fetchAllPages } from "../../../../lib/fetchAllPages";

import toast from "react-hot-toast";

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

type StatusFilter = "all" | "active" | "inactive";

const SELECT = `
    id,
    name,
    email,
    phone,
    is_active,
    birth_date,
    ministry_id,
    ministries ( name )
`;

function mapMember(m: any): Member {
    return {
        ...m,
        ministry_name: m.ministries?.name || null,
        birth_date: m.birth_date ? new Date(m.birth_date).toISOString().split("T")[0] : null,
    };
}

// Tira da busca o que atrapalha o filtro do banco (vírgula, parênteses, curingas)
function cleanSearch(text: string) {
    return text.replace(/[,()*%\\]/g, " ").trim();
}

// Ministérios cujo nome combina com a busca (para achar membros pelo ministério também)
async function matchingMinistryIds(search: string): Promise<string[]> {
    const term = cleanSearch(search);
    if (!term) return [];
    const { data } = await supabase.from("ministries").select("id").ilike("name", `%${term}%`);
    return (data ?? []).map((m: any) => String(m.id));
}

// Filtros: status + nome ou ministério. Síncrono de propósito: a consulta do Supabase é
// "awaitable" e seria executada antes da hora se passasse por um await.
function applyFilters(query: any, search: string, statusFilter: StatusFilter, ministryIds: string[]) {
    let q = query;
    if (statusFilter === "active") q = q.eq("is_active", true);
    if (statusFilter === "inactive") q = q.eq("is_active", false);

    const term = cleanSearch(search);
    if (term) {
        q = ministryIds.length
            ? q.or(`name.ilike.%${term}%,ministry_id.in.(${ministryIds.join(",")})`)
            : q.ilike("name", `%${term}%`);
    }
    return q;
}

// Lista de membros paginada no banco (10 por vez), como no app: funciona com qualquer quantidade
export function useMembersData() {
    const [members, setMembers] = useState<Member[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearchState] = useState("");
    const [statusFilter, setStatusFilterState] = useState<StatusFilter>("all");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Mudou a busca ou o filtro: volta para a primeira página
    const setSearch = (value: string) => {
        setSearchState(value);
        setCurrentPage(1);
    };
    const setStatusFilter = (value: StatusFilter) => {
        setStatusFilterState(value);
        setCurrentPage(1);
    };

    async function loadMembers() {
        try {
            setLoading(true);

            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const ministryIds = await matchingMinistryIds(search);
            const { data, error, count } = await applyFilters(
                supabase.from("members").select(SELECT, { count: "exact" }),
                search,
                statusFilter,
                ministryIds
            )
                .order("name", { ascending: true })
                .order("id", { ascending: true })
                .range(from, from + ITEMS_PER_PAGE - 1);

            if (error) {
                console.error("Erro ao carregar membros:", error);
                setMembers([]);
                setTotalItems(0);
                return;
            }

            setMembers((data || []).map(mapMember));
            setTotalItems(count ?? 0);
        } catch (err) {
            console.error("Erro inesperado ao carregar membros:", err);
            setMembers([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }

    const totalPages = useMemo(() => Math.ceil(totalItems / ITEMS_PER_PAGE), [totalItems]);

    const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

    // PDF com todos os membros do filtro atual (busca página por página no banco)
    async function exportPdf(churchName: string) {
        const loadingToast = toast.loading("Gerando PDF...");
        try {
            const ministryIds = await matchingMinistryIds(search);
            const all = await fetchAllPages<any>((from, to) =>
                applyFilters(supabase.from("members").select(SELECT), search, statusFilter, ministryIds)
                    .order("name", { ascending: true })
                    .order("id", { ascending: true })
                    .range(from, to)
            );

            if (all.length === 0) {
                toast.error("Nenhum membro para exportar.", { id: loadingToast });
                return;
            }

            generateMembersPdf({ churchName, members: all.map(mapMember) });
            toast.success("PDF gerado com sucesso!", { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error("Erro ao gerar PDF.", { id: loadingToast });
        }
    }

    return {
        members,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        loading,
        setLoading,
        loadMembers,
        totalItems,
        paginatedMembers: members,
        totalPages,
        currentPage,
        setCurrentPage,
        handlePrevious,
        handleNext,
        exportPdf,
    };
}
