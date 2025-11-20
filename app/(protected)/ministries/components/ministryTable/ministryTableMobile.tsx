"use client";

import { Calendar, Info, Pencil, Trash } from "lucide-react";

export function MinistryTableMobile({ ministries, onEdit, onDelete }: any) {
    return (
        <div className="md:hidden space-y-4 mt-2">
            {ministries.map((m: any) => (
                <div
                    key={m.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                >
                    <div className="flex items-center gap-2 font-semibold text-gray-900 text-[16px] mb-1">
                        <Info className="w-4 h-4 text-[#38B2AC]" />
                        {m.name}
                    </div>

                    <p className="text-gray-700 text-[15px] mb-2">
                        {m.description || (
                            <span className="text-gray-400 italic">Sem descrição</span>
                        )}
                    </p>

                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Calendar className="w-4 h-4 text-[#38B2AC]" />
                        {new Date(m.created_at).toLocaleDateString("pt-BR")}
                    </div>

                    <div className="flex justify-end gap-5 pt-2">
                        <button
                            onClick={() => onEdit(m)}
                            className="text-emerald-600 hover:text-emerald-700 transition"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => onDelete(m)}
                            className="text-red-600 hover:text-red-700 transition"
                        >
                            <Trash className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
