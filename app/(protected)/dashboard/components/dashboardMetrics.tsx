'use client';

import { CardMetric } from '../../../../components/cardMetric';

interface DashboardMetricsProps {
    currentMonthIncome: number;
    currentMonthExpenses: number;
    visitorCount: number;
    nextEventLabel: string;
    loading: {
        finance: boolean;
        visitors: boolean;
        events: boolean;
    };
}

export function DashboardMetrics({
    currentMonthIncome,
    currentMonthExpenses,
    visitorCount,
    nextEventLabel,
    loading,
}: DashboardMetricsProps) {
    const formatCurrency = (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <CardMetric
                title="Entradas mês atual"
                value={loading.finance ? 'Carregando...' : formatCurrency(currentMonthIncome)}
                color="#38B2AC"
            />
            <CardMetric
                title="Saídas mês atual"
                value={loading.finance ? 'Carregando...' : formatCurrency(currentMonthExpenses)}
                color="#E53E3E"
            />
            <CardMetric
                title="Novos visitantes"
                value={loading.visitors ? '...' : visitorCount.toString()}
                color="#81E6D9"
            />
            <CardMetric
                title="Próximo evento"
                value={loading.events ? 'Carregando...' : nextEventLabel}
                color="#3182CE"
            />
        </section>
    );
}

