'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ModalNewEvent from '../../components/modalNewEvent';

type Event = {
    id: string;
    title: string;
    date: string;
    time: string;
    ministry?: string;
    location?: string;
};

export default function AgendaPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        const { data } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });
        setEvents(data || []);
    }

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-semibold text-gray-700">Agenda & Escalas</h2>

            {/* Próximos eventos */}
            <section className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Próximos eventos</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                    >
                        + Novo Evento
                    </button>
                </div>

                {events.length ? (
                    <ul className="divide-y divide-gray-100">
                        {events.map((event) => (
                            <li key={event.id} className="py-3 flex justify-between">
                                <div>
                                    <p className="font-medium">{event.title}</p>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })} —{' '}
                                        {event.time.slice(0, 5)}
                                    </span>
                                </div>
                                <span className="text-[#38B2AC] font-semibold">
                                    {event.ministry || 'Geral'}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm">Nenhum evento cadastrado ainda.</p>
                )}
            </section>

            {/* Escala Semanal */}
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

            {/* ✅ Modal só aparece quando isModalOpen for true */}
            {isModalOpen && (
                <ModalNewEvent
                    eventData={null}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadEvents}
                />
            )}
        </div>
    );
}