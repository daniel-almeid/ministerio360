'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

type Visitor = {
    id: string;
    name: string;
    visit_date: string;
    phone?: string;
    email?: string;
};

type EventMinistry = {
    ministry: {
        id: string;
        name: string;
    };
};

type Event = {
    id: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
    ministries?: { id: string; name: string }[];
};

type Transaction = {
    amount: number;
    type: 'entrada' | 'saida';
    created_at: string;
};

export function useDashboardData() {
    const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
    const [currentMonthExpenses, setCurrentMonthExpenses] = useState(0);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState({
        finance: true,
        visitors: true,
        events: true,
    });

    function getMonthRange() {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        return { start, end };
    }

    useEffect(() => {
        async function loadData() {
            const { start, end } = getMonthRange();

            try {
                const [
                    income,
                    expenses,
                    allVisitors,
                    eventsData,
                    allTransactions,
                ] = await Promise.all([
                    supabase
                        .from('transactions')
                        .select('amount')
                        .eq('type', 'entrada')
                        .gte('created_at', start.toISOString())
                        .lte('created_at', end.toISOString()),

                    supabase
                        .from('transactions')
                        .select('amount')
                        .eq('type', 'saida')
                        .gte('created_at', start.toISOString())
                        .lte('created_at', end.toISOString()),

                    supabase
                        .from('visitors')
                        .select('id, name, visit_date, phone, email')
                        .order('visit_date', { ascending: false }),

                    supabase
                        .from('events')
                        .select(`
                            id,
                            title,
                            date,
                            time,
                            location,
                            ministries:event_ministries(
                                ministry:ministries(id, name)
                            )
                        `)
                        .gte('date', new Date().toISOString())
                        .order('date', { ascending: true })
                        .limit(5),

                    supabase
                        .from('transactions')
                        .select('amount, type, created_at')
                        .gte('created_at', start.toISOString())
                        .lte('created_at', end.toISOString()),
                ]);

                setCurrentMonthIncome(
                    income.data?.reduce((acc, cur) => acc + Number(cur.amount), 0) ?? 0
                );

                setCurrentMonthExpenses(
                    expenses.data?.reduce((acc, cur) => acc + Number(cur.amount), 0) ?? 0
                );

                setVisitors(allVisitors.data ?? []);

                const formattedEvents =
                    eventsData.data?.map((ev) => ({
                        ...ev,
                        ministries:
                            ev.ministries?.flatMap((m: any) =>
                                Array.isArray(m.ministry) ? m.ministry : [m.ministry]
                            ) || [],
                    })) ?? [];

                setUpcomingEvents(formattedEvents);

                setMonthlyTransactions(allTransactions.data ?? []);

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading({ finance: false, visitors: false, events: false });
            }
        }

        loadData();
    }, []);

    return {
        currentMonthIncome,
        currentMonthExpenses,
        visitors,
        upcomingEvents,
        monthlyTransactions,
        loading,
    };
}
