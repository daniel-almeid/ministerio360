'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type DrawerScaleDetailsProps = {
    scaleId: string;
    onClose: () => void;
};

type ScaleDetails = {
    id: string;
    date: string;
    event_name: string;
    responsible: string;
    ministries: {
        id: string;
        name: string;
        members: { id: string; name: string }[];
    }[];
};

export default function DrawerScaleDetails({ scaleId, onClose }: DrawerScaleDetailsProps) {
    const [data, setData] = useState<ScaleDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (scaleId) loadDetails();
    }, [scaleId]);

    async function loadDetails() {
        setLoading(true);

        const { data: scale, error } = await supabase
            .from('scales')
            .select(`
                id,
                date,
                event_name,
                responsible,
                scale_ministries (
                    ministries: ministry_id ( id, name )
                )
            `)
            .eq('id', scaleId)
            .single();

        if (error || !scale) {
            console.error('Erro ao buscar escala:', error?.message);
            setLoading(false);
            return;
        }

        const { data: assignments, error: assignError } = await supabase
            .from('scale_assignments')
            .select(`
                member_id,
                ministry_id,
                members ( id, name )
            `)
            .eq('scale_id', scaleId);

        if (assignError) {
            console.error('Erro ao buscar membros escalados:', assignError.message);
        }

        const ministriesWithMembers =
            (scale.scale_ministries || []).map((sm: any) => {
                const ministryId = sm.ministries.id;

                const members =
                    (assignments || [])
                        .filter((a) => a.ministry_id === ministryId)
                        .flatMap((a) =>
                            Array.isArray(a.members)
                                ? a.members.map((m: any) => ({
                                    id: m.id as string,
                                    name: m.name as string,
                                }))
                                : [
                                    {
                                        id: (a.members as any)?.id as string,
                                        name: (a.members as any)?.name as string,
                                    },
                                ]
                        ) || [];

                return {
                    id: ministryId as string,
                    name: sm.ministries.name as string,
                    members,
                };
            }) || [];

        setData({
            id: scale.id,
            date: scale.date,
            event_name: scale.event_name,
            responsible: scale.responsible,
            ministries: ministriesWithMembers,
        });

        setLoading(false);
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Fundo escurecido */}
                <motion.div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />

                {/* Drawer lateral animado */}
                <motion.div
                    className="relative bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Detalhes da Escala
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md hover:bg-gray-100 transition"
                            title="Fechar"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-gray-500 text-sm">Carregando detalhes...</p>
                    ) : !data ? (
                        <p className="text-gray-500 text-sm">Não foi possível carregar esta escala.</p>
                    ) : (
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <div className="border-b pb-3">
                                <p className="text-sm text-gray-500">Data</p>
                                <p className="font-medium text-gray-800">
                                    {format(new Date(data.date), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                            </div>

                            <div className="border-b pb-3">
                                <p className="text-sm text-gray-500">Evento</p>
                                <p className="font-medium text-gray-800">{data.event_name}</p>
                            </div>

                            <div className="border-b pb-3">
                                <p className="text-sm text-gray-500">Responsável</p>
                                <p className="font-medium text-gray-800">{data.responsible}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-2">Ministérios e membros</p>
                                {data.ministries.map((m) => (
                                    <div key={m.id} className="mb-4">
                                        <p className="font-semibold text-[#319795]">{m.name}</p>
                                        {m.members.length > 0 ? (
                                            <ul className="mt-1 ml-3 list-disc text-sm text-gray-700">
                                                {m.members.map((mem) => (
                                                    <li key={mem.id}>{mem.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-gray-400 ml-3 mt-1">
                                                Nenhum membro escalado.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
