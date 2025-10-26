'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ModalNewEvent from '../modalNewEvent';

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

type Props = {
    ministries: Ministry[];
    onRefreshMinistries: () => void;
};

export default function EventSection({ ministries, onRefreshMinistries }: Props) {
    const [events, setEvents] = useState<Event[]>([]);
    const [filterMinistry, setFilterMinistry] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();

        const channel = supabase
            .channel('events-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadEvents)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function loadEvents() {
        setLoading(true);

        const { data, error } = await supabase
            .from('events')
            .select(`
        id,
        title,
        date,
        time,
        location,
        event_ministries ( ministries ( name ) )
      `)
            .order('date', { ascending: true });

        if (error) {
            console.error('Erro ao carregar eventos:', error.message);
            setEvents([]);
        } else {
            const mapped = (data || []).map((ev: any) => ({
                ...ev,
                ministries: ev.event_ministries?.map((em: any) => em.ministries)?.filter(Boolean) || [],
            }));
            setEvents(mapped);
        }

        setLoading(false);
        onRefreshMinistries();
    }

    const filteredEvents = useMemo(() => {
        if (!filterMinistry) return events;
        return events.filter((e) => e.ministries?.some((m) => m.name === filterMinistry));
    }, [events, filterMinistry]);

    const groupedEvents = useMemo(() => {
        return filteredEvents.reduce<Record<string, Event[]>>((groups, ev) => {
            const monthKey = format(new Date(ev.date), 'MMMM yyyy', { locale: ptBR });
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(ev);
            return groups;
        }, {});
    }, [filteredEvents]);

    function isSoon(date: string) {
        const today = new Date();
        const eventDate = new Date(date);
        const diffDays = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 3;
    }

    return (
        <section className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Próximos eventos</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition"
                >
                    + Novo Evento
                </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
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

            {loading ? (
                <p className="text-gray-500 text-sm">Carregando eventos...</p>
            ) : events.length ? (
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                    {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                        <div key={month} className="mb-5">
                            <h4 className="font-semibold text-gray-600 mb-2 capitalize">📅 {month}</h4>
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
                                                {format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })} —{' '}
                                                {event.time?.slice(0, 5)}
                                            </span>
                                            {event.location && (
                                                <p className="text-xs text-gray-400 mt-1">{event.location}</p>
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
                <p className="text-gray-500 text-sm">Nenhum evento cadastrado ainda.</p>
            )}

            {isModalOpen && (
                <ModalNewEvent
                    eventData={null}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadEvents}
                />
            )}
        </section>
    );
}