"use client";

import { useEffect } from "react";
import { useMembersData } from "../../hook/useMembersData";
import { Search, PlusCircle, FileDown } from "lucide-react";
import { PaginationControls } from "../../../../../components/shared/paginationControls";
import Loading from "@/components/shared/loading";
import { useHeaderData } from "../../../../../components/shared/header/useHeaderData";
import { MemberTableDesktop } from "./memberTableDesktop";
import { MemberTableMobile } from "./memberTableMobile";
import { FileText } from "lucide-react";

export default function MemberTable({ reloadFlag, onEdit, onDelete, onNewClick, onContributions }: any) {
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
        setLoading,
        exportPdf,
    } = useMembersData();

    const { churchName } = useHeaderData();

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
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-[#38B2AC]
                         text-sm text-gray-700 placeholder-gray-400"
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
                                onClick={() =>
                                    setStatusFilter(option.key as "all" | "active" | "inactive")
                                }
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => exportPdf(churchName)}
                        title="Exportar PDF"
                        className="relative p-2 rounded-lg border border-teal-400
             bg-white text-[#38B2AC]
             hover:bg-teal-50 transition"
                    >
                        <FileText className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5
                   bg-[#38B2AC] text-white rounded-full">
                            PDF
                        </span>
                    </button>

                    <button
                        onClick={onNewClick}
                        className="flex items-center gap-2 px-3 py-2 bg-[#38B2AC]
                       text-white rounded-lg hover:bg-[#319795]
                       transition-all shadow-sm"
                    >
                        <PlusCircle size={18} />
                        Novo Membro
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-6">
                    <Loading />
                </div>
            ) : paginatedMembers.length > 0 ? (
                <>
                    <div className="hidden md:block">
                        <MemberTableDesktop
                            members={paginatedMembers}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onContributions={onContributions}
                        />
                    </div>

                    <div className="md:hidden">
                        <MemberTableMobile
                            members={paginatedMembers}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onContributions={onContributions}
                        />
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
