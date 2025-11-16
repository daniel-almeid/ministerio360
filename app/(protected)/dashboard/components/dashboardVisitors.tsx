'use client';

import { Calendar, Phone, Mail } from 'lucide-react';
import { useMemo } from 'react';

type Visitor = {
    id: string;
    name: string;
    visit_date: string;
    phone?: string;
    email?: string;
};

interface DashboardVisitorsProps {
    visitors: Visitor[];
    loading: boolean;
}

export function DashboardVisitors({ visitors, loading }: DashboardVisitorsProps) {

    const recentVisitors = useMemo(() => {
        const today = new Date();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 14);

        return visitors.filter((v) => {
            if (!v.visit_date) return false;

            const [y, m, d] = v.visit_date.split('-').map(Number);
            const visitDate = new Date(y, m - 1, d);

            return visitDate >= twoWeeksAgo && visitDate <= today;
        });
    }, [visitors]);


    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Visitantes recentes (últimas 2 semanas)
            </h3>

            {loading ? (
                <p className="text-gray-500 text-center py-8 text-sm">
                    Carregando visitantes...
                </p>
            ) : recentVisitors.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">
                    Nenhum visitante registrado nas últimas semanas.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50/60 border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wide">
                                        Nome
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wide">
                                        Data da Visita
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wide">
                                        Contato
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {recentVisitors.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="hover:bg-[#F9FAFB] transition-all duration-200"
                                    >

                                        <td className="px-5 py-4 font-medium text-gray-800 text-[15px]">
                                            {v.name}
                                        </td>

                                        <td className="px-5 py-4 text-gray-700 flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-[#38B2AC]" />

                                            {v.visit_date
                                                ? v.visit_date
                                                    .split('-')
                                                    .reverse()
                                                    .join('/')
                                                : '-'}
                                        </td>

                                        <td className="px-5 py-4 text-gray-700 text-sm">
                                            {v.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-[#38B2AC]" />
                                                    {v.phone}
                                                </div>
                                            ) : v.email ? (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-[#38B2AC]" />
                                                    {v.email}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Não informado</span>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
