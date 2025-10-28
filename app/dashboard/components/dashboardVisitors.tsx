'use client';

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
    return (
        <section className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-3">Visitantes recentes</h3>

            {loading ? (
                <p className="text-gray-500 text-center py-6">Carregando...</p>
            ) : visitors.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                    Nenhum visitante registrado recentemente.
                </p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b">
                            <th className="pb-2">Nome</th>
                            <th className="pb-2">Data</th>
                            <th className="pb-2">Contato</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitors.map((v) => (
                            <tr key={v.id} className="border-b last:border-none">
                                <td className="py-2">{v.name}</td>
                                <td className="py-2">
                                    {v.visit_date
                                        ? new Date(v.visit_date).toLocaleDateString('pt-BR')
                                        : '-'}
                                </td>
                                <td className="py-2 text-[#38B2AC]">
                                    {v.phone || v.email || 'Não informado'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
