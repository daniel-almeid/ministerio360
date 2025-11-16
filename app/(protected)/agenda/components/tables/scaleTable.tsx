"use client";

import { CalendarDays, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScaleItem } from "../../../../types/agenda";

type Props = {
    scales: ScaleItem[];
    loading: boolean;

    openNew: () => void;
    openView: (s: ScaleItem) => void;
    openEdit: (s: ScaleItem) => void;
    openDelete: (s: ScaleItem) => void;
};

export default function ScaleTable({
    scales,
    loading,
    openNew,
    openView,
    openEdit,
    openDelete,
}: Props) {
    function isSoon(date: string) {
        const today = new Date();
        const target = parseISO(date);
        const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
    }

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-700">Escala Semanal</h3>

                <button
                    onClick={openNew}
                    className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                >
                    + Nova Escala
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500 text-center py-8 text-sm">Carregando...</p>
            ) : (
                <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                    {scales.map((scale) => (
                        <div
                            key={scale.id}
                            className={`p-6 mb-4 rounded-xl border ${isSoon(scale.date)
                                    ? "bg-green-50 border-green-200"
                                    : "hover:bg-gray-50 border-gray-100"
                                }`}
                        >
                            <p className="text-lg font-bold text-gray-800">
                                {scale.event}
                            </p>

                            <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                                <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                                {format(parseISO(scale.date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">Responsável:</span>{" "}
                                {scale.responsible || "-"}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3">
                                {scale.ministries?.map((m) => (
                                    <span
                                        key={m.id}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border bg-[#E6FFFA] text-[#2C7A7B] border-[#81E6D9]"
                                    >
                                        <Users className="w-3 h-3" />
                                        {m.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-end mt-4 gap-2">
                                <button
                                    onClick={() => openView(scale)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs flex items-center gap-1"
                                >
                                    <Eye className="w-4 h-4" /> Ver
                                </button>

                                <button
                                    onClick={() => openEdit(scale)}
                                    className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs flex items-center gap-1"
                                >
                                    <Pencil className="w-4 h-4" /> Editar
                                </button>

                                <button
                                    onClick={() => openDelete(scale)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-1"
                                >
                                    <Trash2 className="w-4 h-4" /> Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
