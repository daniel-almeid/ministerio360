'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ModalNewEvent from './modalNewEvent';

type Event = {
    id: string;
    title: string;
    date: string;
    time: string;
    location?: string | null;
    ministries?: { name: string }[];
};

type Ministry = {
    id: string;
    name: string;
};

export default function AgendaPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterMinistry, setFilterMinistry] = useState('');

    // 🧩 Carrega eventos e ministérios
    useEffect(() => {
        loadData();

        // 🔁 Atualizações em tempo real
        const channel = supabase
            .channel('events-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'events' },
                loadData
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function loadData() {
        setLoading(true);

        // Busca eventos com ministérios
        const { data, error } = await supabase
            .from('events')
            .select(`
        id,
        title,
        date,
        time,
        location,
        event_ministries (
          ministries ( name )
        )
      `)
            .order('date', { ascending: true });

        if (error) {
            console.error('Erro ao carregar eventos:', error.message);
            setEvents([]);
        } else {
            const mapped = (data || []).map((ev: any) => ({
                ...ev,
                ministries:
                    ev.event_ministries?.map((em: any) => em.ministries)?.filter(Boolean) || [],
            }));
            setEvents(mapped);
        }

        // Busca lista de ministérios
        const { data: minData } = await supabase
            .from('ministries')
            .select('id, name')
            .order('name');
        setMinistries(minData || []);

        setLoading(false);
    }

    // Filtra por ministério
    const filteredEvents = useMemo(() => {
        if (!filterMinistry) return events;
        return events.filter((e) =>
            e.ministries?.some((m) => m.name === filterMinistry)
        );
    }, [events, filterMinistry]);

    // Agrupa eventos por mês (com tipagem)
    const groupedEvents = useMemo(() => {
        return filteredEvents.reduce<Record<string, Event[]>>((groups, ev) => {
            const monthKey = format(new Date(ev.date), 'MMMM yyyy', { locale: ptBR });
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(ev);
            return groups;
        }, {});
    }, [filteredEvents]);

    // Destacar eventos próximos
    function isSoon(date: string) {
        const today = new Date();
        const eventDate = new Date(date);
        const diffDays = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 3;
    }

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-semibold text-gray-700">Agenda & Escalas</h2>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-gray-600 text-sm">Filtrar por ministério:</label>
                    <select
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC]"
                        value={filterMinistry}
                        onChange={(e) => setFilterMinistry(e.target.value)}
                    >
                        <option value="">Todos</option>
                        {ministries.map((m) => (
                            <option key={m.id} value={m.name}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                >
                    + Novo Evento
                </button>
            </div>

            {/* 📋 Lista de eventos com scroll */}
            <section className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Próximos eventos</h3>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Carregando eventos...</p>
                ) : events.length ? (
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                            <div key={month} className="mb-5">
                                <h4 className="font-semibold text-gray-600 mb-2 capitalize">
                                    📅 {month}
                                </h4>
                                <ul className="divide-y divide-gray-100">
                                    {monthEvents.map((event) => (
                                        <li
                                            key={event.id}
                                            className={`py-3 px-2 flex justify-between rounded-lg transition ${isSoon(event.date)
                                                ? 'bg-green-50 border-l-4 border-green-400'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium">{event.title}</p>
                                                <span className="text-sm text-gray-500">
                                                    {format(new Date(event.date), 'dd/MM/yyyy', {
                                                        locale: ptBR,
                                                    })}{' '}
                                                    — {event.time?.slice(0, 5)}
                                                </span>
                                                {event.location && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {event.location}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-[#38B2AC] font-semibold text-right">
                                                {event.ministries && event.ministries.length > 0
                                                    ? event.ministries.map((m) => m.name).join(' / ')
                                                    : 'Geral'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">
                        Nenhum evento cadastrado ainda.
                    </p>
                )}
            </section>

            {/* 🗓️ Escala semanal (ainda estática) */}
            <section className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-gray-700 mb-3">Escala Semanal</h3>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b">
                            <th className="pb-2 text-left">Data</th>
                            <th className="pb-2 text-left">Evento</th>
                            <th className="pb-2 text-left">Ministério</th>
                            <th className="pb-2 text-left">Responsável</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2">25/10</td>
                            <td className="py-2">Culto Jovens</td>
                            <td className="py-2">Louvor</td>
                            <td className="py-2">Ana Paula</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2">26/10</td>
                            <td className="py-2">Ensaio Louvor</td>
                            <td className="py-2">Som</td>
                            <td className="py-2">Carlos Souza</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ➕ Modal para novo evento */}
            {isModalOpen && (
                <ModalNewEvent
                    eventData={null}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}