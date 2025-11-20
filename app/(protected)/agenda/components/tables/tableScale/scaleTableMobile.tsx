"use client";

import { ScaleItem } from "../../../../../types/agenda";
import { CalendarDays, Users, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ScaleTableMobile({
    scales,
    openEdit,
    openDelete,
    openView
}: any) {
    return (
        <div className="md:hidden space-y-4">
            {scales.map((scale: ScaleItem) => (
                <div
                    key={scale.id}
                    className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                    <p className="text-base font-semibold text-gray-800">
                        {scale.event}
                    </p>

                    <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                        <CalendarDays className="w-4 h-4 text-[#38B2AC]" />
                        {format(parseISO(scale.date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold">Responsável:</span>{" "}
                        {scale.responsible || "-"}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {scale.ministries?.map((m) => (
                            <span
                                key={m.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border bg-[#E6FFFA] text-[#2C7A7B] border-[#81E6D9]"
                            >
                                <Users className="w-3 h-3" />
                                {m.name}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => openView(scale)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>

                        <button
                            onClick={() => openEdit(scale)}
                            className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => openDelete(scale)}
                            className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
