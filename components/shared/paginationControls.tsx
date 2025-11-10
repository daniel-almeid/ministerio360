"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationControls({
    currentPage,
    totalPages,
    totalItems,
    onNext,
    onPrev,
    itemsPerPage,
}: any) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">
                Exibindo{" "}
                <strong className="text-gray-700">
                    {(currentPage - 1) * itemsPerPage + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-gray-700">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                </strong>{" "}
                de <strong className="text-gray-700">{totalItems}</strong> 
            </span>

            <div className="flex items-center gap-2">
                <button
                    onClick={onPrev}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${currentPage === 1
                            ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                            : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                        }`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${currentPage === totalPages
                            ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                            : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                        }`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
