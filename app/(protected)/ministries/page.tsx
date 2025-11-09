'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import ModalNewMinistry from './modalNewMinistry';
import { Calendar, Info } from 'lucide-react';

type Ministry = {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
};

export default function MinistriesPage() {
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMinistries();
    }, []);

    async function loadMinistries() {
        setLoading(true);

        const { data, error } = await supabase
            .from('ministries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar ministérios:', error.message);
        } else {
            console.log(`✅ ${data.length} ministérios carregados`);
        }

        setMinistries(data || []);
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-700">Ministérios</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                >
                    + Novo Ministério
                </button>
            </div>

            {/* table */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <p className="text-gray-500 text-center py-10">Carregando ministérios...</p>
                ) : ministries.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50/60 backdrop-blur-sm border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Descrição
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Criado em
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {ministries.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="group hover:bg-[#F9FAFB] transition-all duration-200"
                                    >

                                        <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-[#38B2AC]" />
                                            <span>{m.name}</span>
                                        </td>

                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {m.description ? (
                                                m.description
                                            ) : (
                                                <span className="text-gray-400 italic">Sem descrição</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-gray-500 text-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                            {new Date(m.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-10">
                        Nenhum ministério cadastrado ainda.
                    </p>
                )}
            </section>

            {/* Modal */}
            {isModalOpen && (
                <ModalNewMinistry
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadMinistries}
                />
            )}
        </div>
    );
}