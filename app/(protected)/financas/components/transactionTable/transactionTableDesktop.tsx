"use client";

import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Pencil,
    Trash,
} from "lucide-react";

export function TransactionTableDesktop({ data, onEdit, onDelete }: any) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                    <tr>
                        {[
                            "Tipo",
                            "Categoria",
                            "Valor",
                            "Pessoa / Motivo",
                            "Data",
                            "Ações",
                        ].map((h) => (
                            <th
                                key={h}
                                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${h === "Ações" ? "text-center" : "text-left"
                                    } text-gray-600`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {data.map((t: any) => (
                        <tr
                            key={t.id}
                            className="hover:bg-[#F9FAFB] transition-all duration-200"
                        >
                            <td className="px-5 py-4 flex items-center gap-2 text-[15px] font-medium">
                                {t.type === "entrada" ? (
                                    <>
                                        <ArrowUpCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-green-700">Entrada</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-red-700">Saída</span>
                                    </>
                                )}
                            </td>

                            <td className="px-5 py-4 text-gray-700 capitalize">
                                {t.category}
                            </td>

                            <td className="px-5 py-4 font-semibold">
                                R$ {Number(t.amount).toFixed(2).replace(".", ",")}
                            </td>

                            <td className="px-5 py-4 text-gray-700 capitalize">
                                {t.person_name || "-"}
                            </td>

                            <td className="px-5 py-4 flex items-center gap-2 text-gray-600 text-sm">
                                <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                {new Date(t.created_at).toLocaleDateString("pt-BR")}
                            </td>

                            <td className="px-5 py-4 text-center">
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => onEdit(t)}
                                        className="text-emerald-600 hover:text-emerald-700 transition"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onDelete(t.id)}
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
