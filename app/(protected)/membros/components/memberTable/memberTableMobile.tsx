"use client";

import { Calendar, User, Phone, Pencil, Trash } from "lucide-react";

export function MemberTableMobile({ members, onEdit, onDelete }: any) {
    return (
        <div className="md:hidden space-y-4 mt-2">
            {members.map((m: any) => (
                <div
                    key={m.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                >
                    <div className="flex items-center gap-2 font-semibold text-gray-900 text-[16px] mb-1 capitalize">
                        <User className="w-5 h-5 text-[#38B2AC]" />
                        {m.name}
                    </div>

                    <p className="text-gray-700 text-[15px] mb-1">
                        <span className="font-semibold">Ministério:</span>{" "}
                        {m.ministry_name || (
                            <span className="text-gray-400 italic">Sem ministério</span>
                        )}
                    </p>

                    <p className="text-gray-700 text-[15px] mb-1">
                        <span className="font-semibold">Status:</span>{" "}
                        {m.is_active ? (
                            <span className="text-green-700 font-semibold">Ativo</span>
                        ) : (
                            <span className="text-red-700 font-semibold">Inativo</span>
                        )}
                    </p>

                    <div className="text-gray-700 text-[15px] mb-1">
                        {m.phone ? (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#38B2AC]" />
                                {m.phone}
                            </div>
                        ) : (
                            <span className="text-gray-400 italic">Sem telefone</span>
                        )}
                        <div className="text-gray-500 text-xs">{m.email || "Sem e-mail"}</div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Calendar className="w-4 h-4 text-[#38B2AC]" />
                        {m.birth_date
                            ? m.birth_date.split("-").reverse().join("/")
                            : "—"}
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
