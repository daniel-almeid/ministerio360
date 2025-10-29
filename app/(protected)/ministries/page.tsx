'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import ModalNewMinistry from './modalNewMinistry';

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
        }
        setMinistries(data || []);
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho da página */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-700">Ministérios</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-colors"
                >
                    + Novo Ministério
                </button>
            </div>

            {/* Conteúdo */}
            <section className="bg-white p-6 rounded-xl shadow-md">
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Carregando ministérios...</p>
                ) : ministries.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="pb-2 text-left">Nome</th>
                                <th className="pb-2 text-left">Descrição</th>
                                <th className="pb-2 text-left">Criado em</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ministries.map((m) => (
                                <tr
                                    key={m.id}
                                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="py-2 font-medium text-gray-800">{m.name}</td>
                                    <td className="py-2 text-gray-600">{m.description || '-'}</td>
                                    <td className="py-2 text-gray-500">
                                        {new Date(m.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-8">
                        Nenhum ministério cadastrado ainda.
                    </p>
                )}
            </section>

            {/* Modal de Novo Ministério */}
            {isModalOpen && (
                <ModalNewMinistry
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadMinistries}
                />
            )}
        </div>
    );
}
