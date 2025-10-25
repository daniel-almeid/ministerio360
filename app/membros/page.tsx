"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MemberModal from "../../components/memberModal";

type Member = {
    id: string;
    name: string;
    ministry: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    joined_at: string | null;
    created_at: string;
};

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [openModal, setOpenModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadMembers() {
        setLoading(true);
        const { data, error } = await supabase
            .from("members")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao carregar membros:", error);
            setMembers([]);
        } else {
            setMembers((data as Member[]) || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadMembers();
    }, []);

    // 🔍 Aplica busca e filtro de status
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return members.filter((m) => {
            // Filtro de status
            if (statusFilter === "active" && !m.is_active) return false;
            if (statusFilter === "inactive" && m.is_active) return false;

            // Filtro de texto (nome e ministério)
            if (!q) return true;

            const nome = m.name?.toLowerCase() || "";
            const ministerio = m.ministry?.toLowerCase() || "";

            return nome.includes(q) || ministerio.includes(q);
        });
    }, [members, search, statusFilter]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Membros</h2>

            {/* 🔎 Barra de busca + filtro de status + botão */}
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
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                        ${statusFilter === option.key
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

            {/* 📋 Tabela de membros */}
            <div className="bg-white rounded-xl shadow-md">
                {loading ? (
                    <p className="text-gray-500 text-center py-6">Carregando...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">Nenhum membro encontrado.</p>
                ) : (
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
                            {filtered.map((m) => (
                                <tr
                                    key={m.id}
                                    className="border-b last:border-none hover:bg-gray-50 transition"
                                >
                                    <td className="p-3 capitalize font-medium">{m.name}</td>
                                    <td className="p-3 capitalize">{m.ministry || "-"}</td>
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
