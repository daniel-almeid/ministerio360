"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "../../../../lib/supabaseClient";
import { fetchScales } from "../services/scalesService";
import ModalNewScale from "./modals/modalNewScale";
import DrawerScaleDetails from "./drawer/drawerScaleDetails";
import { Calendar, Users, Eye } from "lucide-react";

type Scale = {
    id: string;
    date: string;
    event: string;
    responsible: string;
    ministries: { id: string; name: string }[];
};

export default function ScaleSection() {
    const [scales, setScales] = useState<Scale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);

    useEffect(() => {
        loadScales();

        const channel = supabase
            .channel("scales-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "scales" },
                loadScales
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function loadScales() {
        setLoading(true);
        const data = await fetchScales();
        setScales(data);
        setLoading(false);
    }

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Escala Semanal</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                >
                    + Nova Escala
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500 text-center py-8">Carregando escalas...</p>
            ) : scales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma escala cadastrada.</p>
            ) : (
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
                                <tr
                                    key={item.id}
                                    className="hover:bg-[#F9FAFB] transition-all duration-200"
                                >
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
                                            onClick={() => setSelectedScaleId(item.id)}
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
            )}

            {isModalOpen && (
                <ModalNewScale onClose={() => setIsModalOpen(false)} onSuccess={loadScales} />
            )}

            {selectedScaleId && (
                <DrawerScaleDetails
                    scaleId={selectedScaleId}
                    onClose={() => setSelectedScaleId(null)}
                />
            )}
        </section>
    );
}
