"use client";

import { useEffect } from "react";
import { useMembersData } from "../hook/useMembersData";
import { Calendar, User, Phone, Pencil, Trash, Search, PlusCircle } from "lucide-react";
import { PaginationControls } from "../../../../components/shared/paginationControls";
import Loading from "@/components/shared/loading";

type MemberTableProps = {
    reloadFlag: boolean;
    onEdit: (m: any) => void;
    onDelete: (m: any) => void;
    onNewClick: () => void;
};

export default function MemberTable({ reloadFlag, onEdit, onDelete, onNewClick }: MemberTableProps) {
    const {
        paginatedMembers,
        loading,
        currentPage,
        totalPages,
        filtered,
        loadMembers,
        handlePrevious,
        handleNext,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        setLoading
    } = useMembersData();

    useEffect(() => {
        setLoading(true);
        const delay = setTimeout(() => {
            loadMembers();
        }, 400);
        return () => clearTimeout(delay);
    }, [reloadFlag, currentPage, search, statusFilter]);

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Pesquisar membro..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38B2AC] text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>

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
                    onClick={onNewClick}
                    className="flex items-center gap-2 px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                >
                    <PlusCircle size={18} />
                    Novo Membro
                </button>
            </div>

            {loading ? (
                <div className="py-6">
                    <Loading />
                </div>
            ) : paginatedMembers.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-gray-50/60 border-b border-gray-100">
                                <tr>
                                    {["Nome", "Ministério", "Status", "Contato", "Nascimento", "Ações"].map(
                                        (header) => (
                                            <th
                                                key={header}
                                                className={`px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${header === "Ações" ? "text-center" : "text-left"
                                                    }`}
                                            >
                                                {header}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {paginatedMembers.map((m) => (
                                    <tr key={m.id} className="hover:bg-[#F9FAFB] transition-all duration-200">
                                        <td className="px-5 py-3 flex items-center gap-2 font-medium text-gray-800 capitalize">
                                            <User className="w-4 h-4 text-[#38B2AC]" />
                                            {m.name}
                                        </td>

                                        <td className="px-5 py-3 text-gray-700 capitalize">
                                            {m.ministry_name || (
                                                <span className="text-gray-400 italic">Sem ministério</span>
                                            )}
                                        </td>

                                        <td className="px-5 py-3">
                                            {m.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-green-700 bg-green-100">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-100">
                                                    Inativo
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-3 text-gray-700">
                                            {m.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-[#38B2AC]" />
                                                    {m.phone}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Sem telefone</span>
                                            )}
                                            <div className="text-gray-500 text-xs">
                                                {m.email || "Sem e-mail"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-3 flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                            {m.birth_date
                                                ? m.birth_date.split("-").reverse().join("/")
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-3 text-center">
                                            <div className="flex justify-center gap-3 text-gray-600">
                                                <button
                                                    onClick={() => onEdit(m)}
                                                    className="text-emerald-600 hover:text-emerald-700 transition"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(m)}
                                                    className="text-red-600 hover:text-red-700 transition"
                                                    title="Excluir"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-100 mt-2">
                        <div className="py-2 px-2">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filtered.length}
                                onNext={handleNext}
                                onPrev={handlePrevious}
                                itemsPerPage={10}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                    Nenhum membro cadastrado ainda.
                </p>
            )}
        </section>
    );
}
