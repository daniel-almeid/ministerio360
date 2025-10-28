"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MemberModal from "./memberModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Member = {
    id: string;
    name: string;
    ministry_id: string | null;
    ministry_name?: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    joined_at: string | null;
};

const ITEMS_PER_PAGE = 15;

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [openModal, setOpenModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    async function loadMembers() {
        setLoading(true);

        const { data, error } = await supabase
            .from("members")
            .select(`
        id,
        name,
        email,
        phone,
        is_active,
        joined_at,
        ministry_id,
        ministries ( name )
      `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao carregar membros:", error);
            setMembers([]);
        } else {
            const mapped = (data || []).map((m: any) => ({
                ...m,
                ministry_name: m.ministries?.name || null,
            }));
            setMembers(mapped);
            setCurrentPage(1);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadMembers();
    }, []);

    // === FILTRO E BUSCA ===
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return members.filter((m) => {
            if (statusFilter === "active" && !m.is_active) return false;
            if (statusFilter === "inactive" && m.is_active) return false;
            if (!q) return true;
            const nome = m.name?.toLowerCase() || "";
            const ministerio = m.ministry_name?.toLowerCase() || "";
            return nome.includes(q) || ministerio.includes(q);
        });
    }, [members, search, statusFilter]);

    // === PAGINAÇÃO LOCAL ===
    const totalPages = useMemo(() => Math.ceil(filtered.length / ITEMS_PER_PAGE), [filtered]);
    const paginatedMembers = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Membros</h2>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou ministério..."
                        className="px-4 py-2 border rounded-lg w-full md:w-74 focus:ring-2 focus:ring-[#38B2AC] outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                        {[
                            { key: "all", label: "Todos" },
                            { key: "active", label: "Ativos" },
                            { key: "inactive", label: "Inativos" },
                        ].map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setStatusFilter(option.key as any)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === option.key
                                        ? "bg-[#38B2AC] text-white shadow-sm"
                                        : "text-gray-600 hover:text-[#38B2AC]"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition"
                    onClick={() => {
                        setSelectedMember(null);
                        setOpenModal(true);
                    }}
                >
                    + Adicionar Membro
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md">
                {loading ? (
                    <p className="text-gray-500 text-center py-6">Carregando...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">Nenhum membro encontrado.</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Ministério</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Contato</th>
                                        <th className="p-3">Entrada</th>
                                        <th className="p-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedMembers.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="border-b last:border-none hover:bg-gray-50 transition"
                                        >
                                            <td className="p-3 capitalize font-medium">{m.name}</td>
                                            <td className="p-3 capitalize">{m.ministry_name || "-"}</td>
                                            <td className="p-3">
                                                {m.is_active ? (
                                                    <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
                                                        Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-gray-700">{m.email || "-"}</div>
                                                <div className="text-gray-500 text-xs">{m.phone || ""}</div>
                                            </td>
                                            <td className="p-3 text-gray-600">
                                                {m.joined_at
                                                    ? new Date(m.joined_at).toLocaleDateString("pt-BR")
                                                    : "-"}
                                            </td>
                                            <td
                                                className="p-3 text-right text-[#38B2AC] cursor-pointer hover:underline"
                                                onClick={() => {
                                                    setSelectedMember(m);
                                                    setOpenModal(true);
                                                }}
                                            >
                                                Editar
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* === PAGINAÇÃO MODERNA === */}
                        {totalPages > 1 && (
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 border-t border-gray-100 pt-4 px-4 pb-2">
                                <span className="text-sm text-gray-500">
                                    Exibindo{" "}
                                    <strong className="text-gray-700">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                    </strong>{" "}
                                    -{" "}
                                    <strong className="text-gray-700">
                                        {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                                    </strong>{" "}
                                    de{" "}
                                    <strong className="text-gray-700">{filtered.length}</strong> membros
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentPage === 1}
                                        className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${currentPage === 1
                                                ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                                                : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                                            }`}
                                        aria-label="Página anterior"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {/* Páginas numeradas com elipses */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(
                                                (page) =>
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                            )
                                            .map((page, i, arr) => (
                                                <div key={page}>
                                                    {i > 0 && arr[i - 1] !== page - 1 && (
                                                        <span className="text-gray-400 px-1">…</span>
                                                    )}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${currentPage === page
                                                                ? "bg-[#38B2AC] text-white shadow-md"
                                                                : "text-gray-600 hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${currentPage === totalPages
                                                ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                                                : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                                            }`}
                                        aria-label="Próxima página"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {openModal && (
                <MemberModal
                    member={selectedMember}
                    onClose={() => setOpenModal(false)}
                    onSuccess={loadMembers}
                />
            )}
        </div>
    );
}
