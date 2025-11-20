"use client";

import { ScaleItem } from "../../../../../types/agenda";
import { CalendarDays, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ScaleTableDesktop({
    scales,
    openView,
    openEdit,
    openDelete,
}: any) {

    function isSoon(date: string) {
        const today = new Date();
        const target = parseISO(date);
        const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
    }

    return (
        <div className="hidden md:block max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {scales.map((scale: ScaleItem) => (
                <div
                    key={scale.id}
                    className={`p-6 mb-4 rounded-xl border ${
                        isSoon(scale.date)
                            ? "bg-green-50 border-green-200"
                            : "hover:bg-gray-50 border-gray-100"
                    }`}
                >
                    <p className="text-lg font-bold text-gray-800">{scale.event}</p>

                    <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                        <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                        {format(parseISO(scale.date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold">Responsável:</span> {scale.responsible || "-"}
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
                        <button onClick={() => openView(scale)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs flex items-center gap-1">
                            <Eye className="w-4 h-4" /> Ver
                        </button>

                        <button onClick={() => openEdit(scale)} className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs flex items-center gap-1">
                            <Pencil className="w-4 h-4" /> Editar
                        </button>

                        <button onClick={() => openDelete(scale)} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
