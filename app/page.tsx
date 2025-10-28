'use client';

import { useDashboardData } from '../app/dashboard/hooks/useDashboardData';
import { DashboardMetrics } from '../app/dashboard/components/dashboardMetrics';
import { DashboardEvents } from '../app/dashboard/components/dashboardEvents';
import { DashboardVisitors } from '../app/dashboard/components/dashboardVisitors';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardFinanceChart } from './dashboard/components/dashboardFinanceChart';

export default function DashboardPage() {
  const {
    currentMonthIncome,
    currentMonthExpenses,
    recentVisitors,
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

  return (
    <div className="space-y-8">
      <DashboardMetrics
        currentMonthIncome={currentMonthIncome}
        currentMonthExpenses={currentMonthExpenses}
        visitorCount={recentVisitors.length}
        nextEventLabel={getNextEventLabel()}
        loading={loading}
      />

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-700 mb-3">Entradas vs Saídas</h3>
          <DashboardFinanceChart
            data={monthlyTransactions}
            loading={loading.finance}
          />
        </div>

        <DashboardEvents events={upcomingEvents} loading={loading.events} />
      </section>

      <DashboardVisitors visitors={recentVisitors} loading={loading.visitors} />
    </div>
  );
}