"use client";

import { Calendar, Users, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScaleItem } from "../../../../types/agenda";

type Props = {
    scales: ScaleItem[];
    onView: (id: string) => void;
};

export default function ScaleTable({ scales, onView }: Props) {
    return (
        <div className="overflow-x-auto max-h-[340px] rounded-xl">
            <table className="w-full border-collapse table-fixed">
                <colgroup>
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "33%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "10%" }} />
                </colgroup>

                <thead className="bg-gray-50/60 border-b border-gray-100 text-gray-500 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                            Data
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                            Evento
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                            Ministérios
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                            Responsável
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                            Ações
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {scales.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F9FAFB] transition-all duration-200">
                            <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                    {format(new Date(item.date), "dd/MM", { locale: ptBR })}
                                </div>
                            </td>

                            <td className="px-4 py-3 text-gray-700 font-medium truncate">
                                {item.event}
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                    {item.ministries?.map((m) => (
                                        <span
                                            key={m.id}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#319795] bg-[#E6FFFA]"
                                        >
                                            <Users className="w-3 h-3" />
                                            {m.name}
                                        </span>
                                    ))}
                                </div>
                            </td>

                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                {item.responsible}
                            </td>

                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => onView(item.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#319795] bg-[#E6FFFA] rounded-lg hover:bg-[#B2F5EA] transition-all"
                                >
                                    <Eye className="w-4 h-4" />
                                    Ver
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
