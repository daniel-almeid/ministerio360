'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Event = {
    id: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
};

interface DashboardEventsProps {
    events: Event[];
    loading: boolean;
}

export function DashboardEvents({ events, loading }: DashboardEventsProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-3">Próximos Eventos</h3>
            {loading ? (
                <p className="text-gray-500 text-sm">Carregando eventos...</p>
            ) : events.length ? (
                <ul className="divide-y divide-gray-100">
                    {events.map((event) => (
                        <li key={event.id} className="py-2">
                            <strong>{event.title}</strong> —{' '}
                            {format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })}{' '}
                            {event.time && `às ${event.time.slice(0, 5)}`}
                            {event.location && (
                                <span className="text-gray-500"> — {event.location}</span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-sm">Nenhum evento futuro encontrado.</p>
            )}
        </div>
    );
}
