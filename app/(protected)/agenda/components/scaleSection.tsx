'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../../../lib/supabaseClient';
import { fetchScales } from '../../../../lib/scalesService';
import ModalNewScale from '../modalNewScale';
import DrawerScaleDetails from '../drawerScaleDetails';

export default function ScaleSection() {
    const [scales, setScales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);

    useEffect(() => {
        loadScales();

        const channel = supabase
            .channel('scales-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scales' }, loadScales)
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
        <section className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Escala Semanal</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition"
                >
                    + Nova Escala
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500 text-sm px-2">Carregando escalas...</p>
            ) : scales.length === 0 ? (
                <p className="text-gray-500 text-sm px-2">Nenhuma escala cadastrada.</p>
            ) : (
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                    <table className="w-full text-sm text-gray-700 border-collapse">
                        <thead className="bg-gray-50 border-b text-gray-500 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 text-left font-medium bg-gray-50">Data</th>
                                <th className="py-3 text-left font-medium bg-gray-50">Evento</th>
                                <th className="py-3 text-left font-medium bg-gray-50">Ministérios</th>
                                <th className="py-3 text-left font-medium bg-gray-50">Responsável</th>
                                <th className="py-3 text-center font-medium bg-gray-50">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scales.map((item) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                    <td className="py-3 px-2 align-top">
                                        {format(new Date(item.date), 'dd/MM', { locale: ptBR })}
                                    </td>
                                    <td className="py-3 px-2 font-medium align-top">{item.event}</td>
                                    <td className="py-3 px-2 align-top">
                                        <div className="flex flex-wrap gap-1">
                                            {item.ministries.map((m: any) => (
                                                <span
                                                    key={m.id}
                                                    className="bg-[#E6FFFA] text-[#319795] px-2 py-0.5 rounded-full text-xs font-medium"
                                                >
                                                    {m.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 align-top">{item.responsible}</td>
                                    <td className="py-3 px-2 text-center align-top">
                                        <button
                                            onClick={() => setSelectedScaleId(item.id)}
                                            className="px-3 py-1.5 text-sm font-medium text-[#319795] bg-[#E6FFFA] rounded-lg hover:bg-[#B2F5EA] transition"
                                        >
                                            Ver detalhes
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