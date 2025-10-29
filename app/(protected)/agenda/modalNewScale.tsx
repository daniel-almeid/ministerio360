'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';
import { createScale } from '../../../lib/scalesService';

type ModalNewScaleProps = {
    onClose: () => void;
    onSuccess: () => void;
};

type Ministry = { id: string; name: string };
type Member = { id: string; name: string };

export default function ModalNewScale({ onClose, onSuccess }: ModalNewScaleProps) {
    const [form, setForm] = useState({
        date: '',
        event: '',
        responsible: '',
        ministriesSelected: [] as string[],
        selectedByMinistry: {} as Record<string, string[]>,
    });

    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [membersByMinistry, setMembersByMinistry] = useState<Record<string, Member[]>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('ministries')
                .select('id, name')
                .order('name');

            if (!error && data) setMinistries(data as Ministry[]);
        })();
    }, []);

    const ministriesSelectedObjects = useMemo(
        () => ministries.filter((m) => form.ministriesSelected.includes(m.id)),
        [ministries, form.ministriesSelected],
    );

    async function ensureMembersLoaded(ministryId: string) {
        if (membersByMinistry[ministryId]) return;

        const { data, error } = await supabase
            .from('members')
            .select('id, name')
            .eq('ministry_id', ministryId)
            .order('name');

        if (error) {
            console.error('Erro ao carregar membros do ministério:', error.message);
            return;
        }

        const list = (data || []).map((m) => ({ id: m.id, name: m.name }));
        setMembersByMinistry((prev) => ({ ...prev, [ministryId]: list }));
    }

    function toggleMinistry(ministryId: string) {
        setForm((prev) => {
            const exists = prev.ministriesSelected.includes(ministryId);
            const nextMinistries = exists
                ? prev.ministriesSelected.filter((id) => id !== ministryId)
                : [...prev.ministriesSelected, ministryId];

            const nextSelectedByMinistry = { ...prev.selectedByMinistry };
            if (exists) delete nextSelectedByMinistry[ministryId];

            return { ...prev, ministriesSelected: nextMinistries, selectedByMinistry: nextSelectedByMinistry };
        });

        if (!form.ministriesSelected.includes(ministryId)) {
            ensureMembersLoaded(ministryId);
        }
    }

    function toggleMember(ministryId: string, memberId: string) {
        setForm((prev) => {
            const current = prev.selectedByMinistry[ministryId] || [];
            const selected = current.includes(memberId);
            const next = selected ? current.filter((id) => id !== memberId) : [...current, memberId];

            return {
                ...prev,
                selectedByMinistry: {
                    ...prev.selectedByMinistry,
                    [ministryId]: next,
                },
            };
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.date || !form.event || !form.responsible || form.ministriesSelected.length === 0) return;

        setLoading(true);
        try {
            const assignments = Object.entries(form.selectedByMinistry).map(([ministryId, memberIds]) => ({
                ministryId,
                memberIds,
            }));

            await createScale({
                date: form.date,
                event: form.event,
                responsible: form.responsible,
                ministriesIds: form.ministriesSelected,
                assignments,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err?.message || err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                
                <motion.div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />

                <motion.div
                    className="relative bg-white w-full max-w-xl h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Nova Escala</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md hover:bg-gray-100 transition"
                            title="Fechar"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Data</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Responsável</label>
                                <input
                                    type="text"
                                    value={form.responsible}
                                    onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                                    placeholder="Ex: Ana Paula"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Evento</label>
                                <input
                                    type="text"
                                    value={form.event}
                                    onChange={(e) => setForm({ ...form, event: e.target.value })}
                                    placeholder="Ex: Culto Jovens"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Ministérios</label>
                            <div className="flex flex-wrap gap-2">
                                {ministries.map((m) => {
                                    const selected = form.ministriesSelected.includes(m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => toggleMinistry(m.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                                                selected
                                                    ? 'bg-[#38B2AC] text-white border-[#38B2AC]'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {m.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {ministriesSelectedObjects.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Membros</label>
                                <div className="max-h-[180px] overflow-y-auto border rounded-lg p-2">
                                    {ministriesSelectedObjects.map((min) => {
                                        const list = membersByMinistry[min.id] || [];
                                        return (
                                            <div key={min.id} className="mb-3">
                                                <p className="text-sm font-medium text-gray-700 mb-1">{min.name}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {list.length === 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            Nenhum membro encontrado
                                                        </span>
                                                    )}
                                                    {list.map((mem) => {
                                                        const selected =
                                                            (form.selectedByMinistry[min.id] || []).includes(mem.id);
                                                        return (
                                                            <button
                                                                key={mem.id}
                                                                type="button"
                                                                onClick={() => toggleMember(min.id, mem.id)}
                                                                className={`px-3 py-1 rounded-full text-xs border font-medium transition ${
                                                                    selected
                                                                        ? 'bg-[#E6FFFA] text-[#319795] border-[#38B2AC]'
                                                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {mem.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-[#38B2AC] text-white text-sm rounded-lg hover:bg-[#319795] transition disabled:opacity-50"
                            >
                                {loading ? 'Salvando...' : 'Salvar Escala'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}