'use client';

import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Transaction = {
    amount: number;
    type: 'entrada' | 'saida';
    created_at: string;
};

interface DashboardFinanceChartProps {
    data: Transaction[];
    loading: boolean;
}

export function DashboardFinanceChart({ data, loading }: DashboardFinanceChartProps) {
    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                Carregando gráfico...
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400">
                Nenhum dado disponível para este mês.
            </div>
        );
    }

    // Agrupar entradas e saídas por dia
    const groupedData: Record<string, { entrada: number; saida: number }> = {};

    data.forEach((item) => {
        const day = format(new Date(item.created_at), 'dd/MM', { locale: ptBR });
        if (!groupedData[day]) groupedData[day] = { entrada: 0, saida: 0 };
        groupedData[day][item.type] += item.amount;
    });

    const chartData = Object.entries(groupedData).map(([day, values]) => ({
        day,
        entrada: values.entrada,
        saida: values.saida,
    }));

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#4B5563' }} />
                <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} />
                <Tooltip
                    formatter={(value: number) =>
                        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    }
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                    }}
                />
                <Legend
                    verticalAlign="top"
                    height={24}
                    wrapperStyle={{ fontSize: 12, color: '#374151' }}
                />
                <Bar dataKey="entrada" name="Entradas" fill="#38B2AC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saida" name="Saídas" fill="#E53E3E" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
