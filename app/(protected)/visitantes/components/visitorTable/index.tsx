"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, PlusCircle } from "lucide-react";
import { PaginationControls } from "@/components/shared/paginationControls";
import Loading from "@/components/shared/loading";

import { useFollowup } from "./useFollowup";
import { VisitorTableDesktop } from "./visitorTableDesktop";
import { VisitorTableMobile } from "./visitorTableMobile";

type Props = {
    visitors: any[];
    loading: boolean;
    search: string;
    setSearch: (v: string) => void;
    onNewClick: () => void;
    onSelect: (v: any) => void;
    showArchived: boolean;
    onToggleArchived: () => void;
};

export default function VisitorTable({
    visitors: initialVisitors,
    loading,
    search,
    setSearch,
    onNewClick,
    onSelect,
    showArchived,
    onToggleArchived,
}: Props) {
    const [visitors, setVisitors] = useState(initialVisitors);
    const [statusFilter, setStatusFilter] = useState("all");

    const [statusLoading, setStatusLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const { processingId, handleFollowup, handleFinish } = useFollowup();

    useMemo(() => setVisitors(initialVisitors), [initialVisitors]);

    useEffect(() => {
        setStatusLoading(true);
        const timer = setTimeout(() => setStatusLoading(false), 350);
        return () => clearTimeout(timer);
    }, [statusFilter]);

    useEffect(() => {
        setPageLoading(true);
        const timer = setTimeout(() => setPageLoading(false), 350);
        return () => clearTimeout(timer);
    }, [currentPage]);

    const filteredByArchive = useMemo(() => {
        return visitors.filter((v) => !!v.archived === showArchived);
    }, [visitors, showArchived]);

    const filteredByStatus = useMemo(() => {
        if (statusFilter === "all") return filteredByArchive;
        return filteredByArchive.filter((v) => v.followup_status === statusFilter);
    }, [filteredByArchive, statusFilter]);

    const sortedVisitors = useMemo(
        () =>
            [...filteredByStatus].sort((a, b) =>
                a.name?.localeCompare(b.name ?? "", "pt-BR", { sensitivity: "base" })
            ),
        [filteredByStatus]
    );

    const totalItems = sortedVisitors.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedVisitors = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedVisitors.slice(start, start + itemsPerPage);
    }, [sortedVisitors, currentPage]);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };

    async function handleFollowupClick(v: any) {
        const updated = await handleFollowup(v);
        if (updated) {
            setVisitors((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
        }
    }

    async function handleFinishClick(v: any) {
        const updated = await handleFinish(v);
        if (updated) {
            setVisitors((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
        }
    }

    const isLoading = loading || statusLoading || pageLoading;

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4 md:p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-3">

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Pesquisar visitante..."
                            value={search}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setSearch(e.target.value);
                            }}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38B2AC] text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    {!showArchived && (
                        <div
                            className="
                                flex items-center 
                                bg-gray-100 rounded-full
                                gap-2 px-1.5 py-2
                                md:gap-2 md:px-2 md:py-1    /* DESKTOP */
                            "
                        >
                            {[
                                { key: "all", label: "Todos" },
                                { key: "pendente", label: "Pendente" },
                                { key: "em_andamento", label: "Em andamento" },
                                { key: "concluido", label: "Concluído" },
                            ].map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setStatusFilter(option.key);
                                    }}
                                    className={`
                                        rounded-full font-medium transition-all

                                        text-xs px-2 py-1              /* MOBILE */
                                        md:text-sm md:px-4 md:py-1.5   /* DESKTOP */

                                        ${
                                            statusFilter === option.key
                                                ? "bg-[#38B2AC] text-white shadow-sm"
                                                : "text-gray-600 hover:text-[#38B2AC]"
                                        }
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleArchived}
                        className="px-4 py-2 rounded-lg border flex items-center gap-2 bg-white text-gray-700"
                    >
                        {showArchived ? "Ativos" : "Arquivados"}
                    </button>

                    {!showArchived && (
                        <button
                            onClick={onNewClick}
                            className="flex items-center gap-2 px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                        >
                            <PlusCircle size={18} />
                            Novo Visitante
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="py-6">
                    <Loading />
                </div>
            ) : paginatedVisitors.length > 0 ? (
                <>
                    <VisitorTableDesktop
                        visitors={paginatedVisitors}
                        onSelect={onSelect}
                        onFollowup={handleFollowupClick}
                        onFinish={handleFinishClick}
                        processingId={processingId}
                        showArchived={showArchived}
                    />

                    <VisitorTableMobile
                        visitors={paginatedVisitors}
                        onSelect={onSelect}
                        onFollowup={handleFollowupClick}
                        onFinish={handleFinishClick}
                        processingId={processingId}
                        showArchived={showArchived}
                        isLoading={isLoading}
                    />

                    <div className="border-t border-gray-100 mt-2">
                        <div className="py-2 px-2">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                onNext={handleNext}
                                onPrev={handlePrevious}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                    {showArchived ? "Nenhum visitante arquivado." : "Nenhum visitante encontrado."}
                </p>
            )}
        </section>
    );
}
