'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

type Event = {
    id: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
    ministries?: { id: string; name: string }[];
};

interface DashboardEventsProps {
    events: Event[];
    loading: boolean;
}

export function DashboardEvents({ events, loading }: DashboardEventsProps) {
    const today = new Date();

    function isNextEvent(eventDate: string) {
        const date = new Date(eventDate);
        const diffDays = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 3;
    }

    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Próximos eventos</h3>

            {loading ? (
                <p className="text-gray-500 text-center py-8 text-sm">Carregando eventos...</p>
            ) : events.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">
                    Nenhum evento futuro encontrado.
                </p>
            ) : (
                <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {events.map((event) => {
                        const isNext = isNextEvent(event.date);
                        return (
                            <li
                                key={event.id}
                                className={`flex justify-between items-center py-4 px-2 rounded-xl transition-all duration-200 ${
                                    isNext
                                        ? 'bg-[#E6FFFA]/80 border-l-4 border-[#38B2AC]'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-semibold text-gray-800">
                                        {event.title}
                                    </span>

                                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                                {format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })}
                                            </div>

                                            {event.time && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-[#38B2AC]" />
                                                    {event.time.slice(0, 5)}
                                                </div>
                                            )}

                                            {event.location && (
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <MapPin className="w-4 h-4 text-[#38B2AC]" />
                                                    {event.location}
                                                </div>
                                            )}
                                        </div>

                                        {event.ministries && event.ministries.length > 0 && (
                                            <div className="flex items-center gap-1 text-gray-700 text-xs mt-1">
                                                <Users className="w-4 h-4 text-[#38B2AC]" />
                                                <span>
                                                    {event.ministries.map((m) => m.name).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isNext && (
                                    <span className="text-xs font-medium text-[#38B2AC] bg-[#E6FFFA] px-3 py-1 rounded-full">
                                        Próximo evento
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
