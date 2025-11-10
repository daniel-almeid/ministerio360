'use client';

import { useEffect } from 'react';
import { useMinistries } from '../hook/useMinistries';
import { Calendar, Info, Pencil, Trash, Search, PlusCircle } from 'lucide-react';
import { PaginationControls } from "../../../../components/shared/paginationControls";
import Loading from '@/components/shared/loading';


type MinistryTableProps = {
    reloadFlag: boolean;
    onEdit: (m: any) => void;
    onDelete: (m: any) => void;
    onNewClick: () => void;
};

export default function MinistryTable({ reloadFlag, onEdit, onDelete, onNewClick }: MinistryTableProps) {
    const {
        ministries,
        loading,
        currentPage,
        totalPages,
        totalItems,
        loadMinistries,
        handlePrev,
        handleNext,
        searchTerm,
        setSearchTerm,
    } = useMinistries();

    useEffect(() => {
        const delay = setTimeout(() => {
            loadMinistries();
        }, 400);
        return () => clearTimeout(delay);
    }, [reloadFlag, currentPage, searchTerm]);

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Pesquisar ministério..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38B2AC] text-sm text-gray-700 placeholder-gray-400"
                    />
                </div>

                <button
                    onClick={onNewClick}
                    className="flex items-center gap-2 px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                >
                    <PlusCircle size={18} />
                    Novo Ministério
                </button>
            </div>

            {loading ? (
                <div className="py-10">
                    <Loading />
                </div>
            ) : ministries.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50/60 border-b border-gray-100">
                                <tr>
                                    {["Nome", "Descrição", "Criado em", "Ações"].map((header) => (
                                        <th
                                            key={header}
                                            className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                                                header === "Ações" ? "text-center" : "text-left"
                                            }`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {ministries.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="hover:bg-[#F9FAFB] transition-all duration-200"
                                    >
                                        <td className="px-5 py-4 flex items-center gap-2 text-[15px] font-medium text-gray-800">
                                            <Info className="w-4 h-4 text-[#38B2AC]" />
                                            {m.name}
                                        </td>

                                        <td className="px-5 py-4 text-gray-700 text-sm">
                                            {m.description ? (
                                                m.description
                                            ) : (
                                                <span className="text-gray-400 italic">Sem descrição</span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 flex items-center gap-2 text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                            {new Date(m.created_at).toLocaleDateString('pt-BR')}
                                        </td>

                                        <td className="px-5 py-4 text-center">
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

                    <div className="pt-6 pb-2">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            itemsPerPage={10}
                        />
                    </div>
                </>
            ) : (
                <p className="text-gray-500 text-sm text-center py-10">
                    Nenhum ministério cadastrado ainda.
                </p>
            )}
        </section>
    );
}
