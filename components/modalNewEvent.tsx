'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
    eventData?: {
        id: string;
        title: string;
        date: string;
        time: string;
        ministry: string | null;
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
        ministry: '',
        location: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (eventData) {
            setForm({
                title: eventData.title,
                date: eventData.date ? eventData.date.split('T')[0] : '',
                time: eventData.time || '',
                ministry: eventData.ministry || '',
                location: eventData.location || '',
            });
        }
    }, [eventData]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...form,
            ministry: form.ministry || null,
            location: form.location || null,
        };

        let error;
        if (eventData) {
            const { error: updateError } = await supabase
                .from('events')
                .update(payload)
                .eq('id', eventData.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('events').insert([payload]);
            error = insertError;
        }

        setSaving(false);

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            onSuccess();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Fundo translúcido */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            ></div>

            {/* Conteúdo do modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 z-10">
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
                            type="text"
                            placeholder="Ministério (opcional)"
                            className="border p-2 rounded-lg"
                            value={form.ministry}
                            onChange={(e) => setForm({ ...form, ministry: e.target.value })}
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
                            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
