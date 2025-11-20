"use client";

import { Calendar, Info, Pencil, Trash } from "lucide-react";

export function MinistryTableDesktop({ ministries, onEdit, onDelete }: any) {
    return (
        <div className="max-h-130 overflow-y-auto custom-scrollbar">
            <table className="w-full border-collapse">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                    <tr>
                        {["Nome", "Descrição", "Criado em", "Ações"].map((header) => (
                            <th
                                key={header}
                                className={`px-5 py-3 text-xs font-semibold text-black-500 uppercase tracking-wide ${header === "Ações" ? "text-center" : "text-left"
                                    }`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {ministries.map((m: any) => (
                        <tr
                            key={m.id}
                            className="hover:bg-[#F9FAFB] transition-all duration-200"
                        >
                            <td className="px-5 py-4 flex items-center gap-2 text-[15px] font-medium text-gray-800">
                                <Info className="w-4 h-4 text-[#38B2AC]" />
                                {m.name}
                            </td>

                            <td className="px-5 py-4 text-gray-700 text-sm">
                                {m.description || (
                                    <span className="text-gray-400 italic">Sem descrição</span>
                                )}
                            </td>

                            <td className="px-5 py-4 flex items-center gap-2 text-gray-600 text-sm">
                                <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                {new Date(m.created_at).toLocaleDateString("pt-BR")}
                            </td>

                            <td className="px-5 py-4 text-center">
                                <div className="flex justify-center gap-3 text-gray-600">
                                    <button
                                        onClick={() => onEdit(m)}
                                        className="text-emerald-600 hover:text-emerald-700 transition"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onDelete(m)}
                                        className="text-red-600 hover:text-red-700 transition"
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
    );
}
