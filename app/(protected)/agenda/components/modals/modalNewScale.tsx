"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ModalNewScale({ onClose, onSuccess }: any) {
    const [form, setForm] = useState({
        date: "",
        event: "",
        responsible: "",
        ministriesSelected: [] as string[]
    });

    const [ministries, setMinistries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMinistries();
    }, []);

    async function loadMinistries() {
        const { data } = await supabase.from("ministries").select("id, name").order("name");
        setMinistries(data || []);
    }

    function toggle(id: string) {
        setForm((p) => ({
            ...p,
            ministriesSelected: p.ministriesSelected.includes(id)
                ? p.ministriesSelected.filter((x) => x !== id)
                : [...p.ministriesSelected, id]
        }));
    }

    async function submit(e: any) {
        e.preventDefault();
        setLoading(true);

        const selectedMinistries = ministries
            .filter((m) => form.ministriesSelected.includes(m.id))
            .map((m) => ({ id: m.id, name: m.name }));

        await supabase.from("scales").insert({
            date: form.date,
            event_name: form.event,
            responsible: form.responsible,
            ministries: selectedMinistries
        });

        toast.success("Escala criada");
        onSuccess();
        onClose();
        setLoading(false);
    }

    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="absolute inset-0 bg-black/50" onClick={onClose} />

                <motion.div className="relative bg-white w-full max-w-xl h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Nova Escala</h3>
                        <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input className="border rounded-lg px-3 py-2 text-sm" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Responsável" required value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} />
                            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Evento" required value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Ministérios</p>
                            <div className="flex flex-wrap gap-2">
                                {ministries.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => toggle(m.id)}
                                        className={`px-3 py-1 rounded-full text-xs border ${form.ministriesSelected.includes(m.id) ? "bg-[#38B2AC] text-white border-[#38B2AC]" : "bg-gray-50 text-gray-600 border-gray-200"
                                            }`}
                                    >
                                        {m.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg">
                                {loading ? "Salvando..." : "Salvar Escala"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
