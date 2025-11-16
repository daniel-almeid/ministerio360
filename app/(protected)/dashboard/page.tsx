"use client";

import { useDashboardData } from '../dashboard/hooks/useDashboardData';
import { DashboardMetrics } from '../dashboard/components/dashboardMetrics';
import { DashboardEvents } from '../dashboard/components/dashboardEvents';
import { DashboardVisitors } from '../dashboard/components/dashboardVisitors';
import { DashboardFinanceChart } from '../dashboard/components/dashboardFinanceChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Loading from "@/components/shared/loading";

export default function DashboardPage() {
    const {
        currentMonthIncome,
        currentMonthExpenses,
        visitors,
        upcomingEvents,
        loading,
        monthlyTransactions,
    } = useDashboardData();

    const getNextEventLabel = () => {
        if (!upcomingEvents.length) return 'Nenhum evento futuro';
        const event = upcomingEvents[0];
        const formattedDate = format(new Date(event.date), 'dd/MM', { locale: ptBR });
        return `${event.title} (${formattedDate})`;
    };

    const isLoading =
        loading.finance ||
        loading.events ||
        loading.visitors;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <Loading />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardMetrics
                currentMonthIncome={currentMonthIncome}
                currentMonthExpenses={currentMonthExpenses}
                visitorCount={visitors.length}
                nextEventLabel={getNextEventLabel()}
                loading={loading}
            />

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">Entradas vs Saídas</h3>
                    <DashboardFinanceChart
                        data={monthlyTransactions}
                        loading={loading.finance}
                    />
                </div>

                <DashboardEvents events={upcomingEvents} loading={loading.events} />
            </section>

            <div className="rounded-xl">
                <DashboardVisitors visitors={visitors} loading={loading.visitors} />
            </div>
        </div>
    );
}
