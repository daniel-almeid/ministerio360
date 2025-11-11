"use client";

import { useMemo, useState } from "react";
import { Search, PlusCircle } from "lucide-react";
import { PaginationControls } from "@/components/shared/paginationControls";
import Loading from "@/components/shared/loading";
import { TableBody } from "./tableBody";
import { useFollowup } from "./useFollowup";

type Props = {
    visitors: any[];
    loading: boolean;
    search: string;
    setSearch: (v: string) => void;
    onNewClick: () => void;
    onSelect: (v: any) => void;
};

export default function VisitorTable({
    visitors,
    loading,
    search,
    setSearch,
    onNewClick,
    onSelect,
}: Props) {
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const { processingId, handleFollowup } = useFollowup();

    const sortedVisitors = useMemo(
        () =>
            [...visitors].sort((a, b) =>
                a.name?.localeCompare(b.name ?? "", "pt-BR", { sensitivity: "base" })
            ),
        [visitors]
    );

    const totalItems = sortedVisitors.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedVisitors = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedVisitors.slice(start, start + itemsPerPage);
    }, [sortedVisitors, currentPage]);

    const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
    const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4">
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
                </div>

                <button
                    onClick={onNewClick}
                    className="flex items-center gap-2 px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                >
                    <PlusCircle size={18} />
                    Novo Visitante
                </button>
            </div>

            {loading ? (
                <div className="py-6">
                    <Loading />
                </div>
            ) : paginatedVisitors.length > 0 ? (
                <>
                    <TableBody
                        visitors={paginatedVisitors}
                        onSelect={onSelect}
                        onFollowup={handleFollowup}
                        processingId={processingId}
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
                    Nenhum visitante cadastrado ainda.
                </p>
            )}
        </section>
    );
}
