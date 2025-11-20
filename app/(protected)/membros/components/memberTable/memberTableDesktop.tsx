"use client";

import { Calendar, User, Phone, Pencil, Trash } from "lucide-react";

export function MemberTableDesktop({ members, onEdit, onDelete }: any) {
    return (
        <div className="max-h-140 overflow-y-auto custom-scrollbar">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                    <tr>
                        {["Nome", "Ministério", "Status", "Contato", "Nascimento", "Ações"].map((header) => (
                            <th
                                key={header}
                                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wide ${header === "Ações" ? "text-center" : "text-left"
                                    } text-gray-600`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {members.map((m: any) => (
                        <tr key={m.id} className="hover:bg-[#F9FAFB] transition-all duration-200">
                            <td className="px-5 py-3 flex items-center gap-2 font-medium text-gray-800 capitalize">
                                <User className="w-4 h-4 text-[#38B2AC]" />
                                {m.name}
                            </td>

                            <td className="px-5 py-3 text-gray-700 capitalize">
                                {m.ministry_name || (
                                    <span className="text-gray-400 italic">Sem ministério</span>
                                )}
                            </td>

                            <td className="px-5 py-3">
                                {m.is_active ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-green-700 bg-green-100">
                                        Ativo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-100">
                                        Inativo
                                    </span>
                                )}
                            </td>

                            <td className="px-5 py-3 text-gray-700">
                                {m.phone ? (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-[#38B2AC]" />
                                        {m.phone}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">Sem telefone</span>
                                )}

                                <div className="text-gray-500 text-xs">
                                    {m.email || "Sem e-mail"}
                                </div>
                            </td>

                            <td className="px-5 py-3 flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                {m.birth_date
                                    ? m.birth_date.split("-").reverse().join("/")
                                    : "—"}
                            </td>

                            <td className="px-5 py-3 text-center">
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
