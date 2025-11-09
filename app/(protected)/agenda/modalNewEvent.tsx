'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import toast from 'react-hot-toast';

type Ministry = {
    id: string;
    name: string;
};

type Props = {
    eventData?: {
        id: string;
        title: string;
        date: string;
        time: string;
        location: string | null;
    } | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function ModalNewEvent({ eventData, onClose, onSuccess }: Props) {
    const [form, setForm] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
    });
    const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMinistries();
        if (eventData) loadEventData();
    }, [eventData]);

    async function loadMinistries() {
        const { data, error } = await supabase
            .from('ministries')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) toast.error('Erro ao carregar ministérios.');
        setMinistries(data || []);
    }

    async function loadEventData() {
        if (!eventData) return;

        setForm({
            title: eventData.title,
            date: eventData.date?.split('T')[0] || '',
            time: eventData.time || '',
            location: eventData.location || '',
        });

        const { data } = await supabase
            .from('event_ministries')
            .select('ministry_id')
            .eq('event_id', eventData.id);

        setSelectedMinistries(data?.map((em) => em.ministry_id) || []);
    }

    function toggleMinistry(id: string) {
        setSelectedMinistries((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const { title, date, time, location } = form;
        if (!title || !date || !time) {
            toast.error('Preencha todos os campos obrigatórios!');
            setSaving(false);
            return;
        }

        const payload = { title, date, time, location: location || null };
        let eventId = eventData?.id || null;
        let error = null;

        try {
            if (eventData) {
                const { error: updateError } = await supabase
                    .from('events')
                    .update(payload)
                    .eq('id', eventData.id);
                error = updateError;
            } else {
                const { data: newEvent, error: insertError } = await supabase
                    .from('events')
                    .insert([payload])
                    .select('id')
                    .single();
                eventId = newEvent?.id || null;
                error = insertError;
            }

            if (!error && eventId) {
                await supabase.from('event_ministries').delete().eq('event_id', eventId);
                if (selectedMinistries.length > 0) {
                    const inserts = selectedMinistries.map((ministry_id) => ({
                        event_id: eventId!,
                        ministry_id,
                    }));
                    await supabase.from('event_ministries').insert(inserts);
                }
            }

            if (error) {
                console.error('Erro ao salvar evento:', error.message);
                toast.error('Erro ao salvar evento.');
            } else {
                toast.success(eventData ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error(err.message);
            toast.error('Erro inesperado ao salvar evento.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 z-10 animate-fadeIn">
                <h3 className="text-xl font-semibold text-gray-700">
                    {eventData ? 'Editar Evento' : 'Novo Evento'}
                </h3>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Título do evento"
                            className="border p-2 rounded-lg"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            className="border p-2 rounded-lg"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            required
                        />
                        <input
                            type="time"
                            className="border p-2 rounded-lg"
                            value={form.time}
                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Local (opcional)"
                            className="border p-2 rounded-lg col-span-full"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ministérios envolvidos
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ministries.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => toggleMinistry(m.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedMinistries.includes(m.id)
                                            ? 'bg-[#38B2AC] text-white border-[#38B2AC]'
                                            : 'text-gray-600 border-gray-300 hover:border-[#38B2AC]'
                                        }`}
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
