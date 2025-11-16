"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import Loading from "@/components/shared/loading";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DrawerScaleDetails({ scaleId, onClose }: any) {
    const [scale, setScale] = useState<any>(null);
    const [grouped, setGrouped] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (scaleId) loadDetails();
    }, [scaleId]);

    async function loadDetails() {
        setLoading(true);

        const { data: scaleRes } = await supabase
            .from("scales")
            .select("id, date, event_name, responsible")
            .eq("id", scaleId)
            .single();

        const { data: assigns } = await supabase
            .from("scale_assignments")
            .select("ministry_id, member_id")
            .eq("scale_id", scaleId);

        if (!assigns?.length) {
            setScale(scaleRes);
            setGrouped({});
            setLoading(false);
            return;
        }

        const ministryIds = [...new Set(assigns.map(a => a.ministry_id))];
        const memberIds = [...new Set(assigns.map(a => a.member_id))];

        const { data: mins } = await supabase
            .from("ministries")
            .select("id, name")
            .in("id", ministryIds);

        const { data: mems } = await supabase
            .from("members")
            .select("id, name")
            .in("id", memberIds);

        const mapMin = new Map(mins?.map(m => [m.id, m.name]));
        const mapMem = new Map(mems?.map(m => [m.id, m.name]));

        const groupedData: Record<string, string[]> = {};

        assigns.forEach(row => {
            const mName = mapMin.get(row.ministry_id);
            const uName = mapMem.get(row.member_id);
            if (!mName || !uName) return;
            if (!groupedData[mName]) groupedData[mName] = [];
            groupedData[mName].push(uName);
        });

        setScale(scaleRes);
        setGrouped(groupedData);
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
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    className="
                    relative bg-white w-full max-w-md h-full shadow-xl p-6 
                    overflow-y-auto rounded-l-2xl custom-scrollbar pr-2
                "
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Detalhes da Escala
                        </h3>
                        <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-gray-500">Data</p>
                                <p className="font-medium text-gray-800">
                                    {format(parseISO(scale.date), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Evento</p>
                                <p className="font-medium text-gray-800">{scale.event_name}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Responsável</p>
                                <p className="font-medium text-gray-800">{scale.responsible}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-3">Ministérios e Membros</p>

                                {!Object.keys(grouped).length ? (
                                    <p className="text-xs text-gray-400 italic">
                                        Nenhum ministério ou membro listado.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {Object.entries(grouped).map(([ministry, members]) => (
                                            <div
                                                key={ministry}
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                            >
                                                <p className="font-semibold text-[#319795] mb-1">{ministry}</p>

                                                <ul className="text-sm text-gray-700">
                                                    {members.map((m, i) => (
                                                        <li key={i} className="py-0.5">
                                                            {m}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
