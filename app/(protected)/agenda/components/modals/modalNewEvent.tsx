"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ModalNewEvent({ eventData, onClose, onSuccess }: any) {
    const [form, setForm] = useState({ title: "", date: "", time: "", location: "" });
    const [ministries, setMinistries] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMinistries();
        if (eventData) loadData();
    }, [eventData]);

    async function loadMinistries() {
        const { data } = await supabase.from("ministries").select("id, name").order("name");
        setMinistries(data || []);
    }

    async function loadData() {
        setForm({
            title: eventData.title,
            date: eventData.date?.split("T")[0],
            time: eventData.time,
            location: eventData.location || ""
        });

        const { data } = await supabase.from("event_ministries").select("ministry_id").eq("event_id", eventData.id);
        setSelected(data?.map((e) => e.ministry_id) || []);
    }

    function toggle(id: string) {
        setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    }

    async function submit(e: any) {
        e.preventDefault();
        setSaving(true);

        const payload = { ...form, location: form.location || null };
        let eventId = eventData?.id || null;

        if (eventData) {
            await supabase.from("events").update(payload).eq("id", eventId);
        } else {
            const { data } = await supabase.from("events").insert([payload]).select("id").single();
            eventId = data?.id;
        }

        await supabase.from("event_ministries").delete().eq("event_id", eventId);

        if (selected.length > 0) {
            await supabase.from("event_ministries").insert(selected.map((m) => ({ event_id: eventId, ministry_id: m })));
        }

        toast.success("Salvo com sucesso");
        onSuccess();
        onClose();
        setSaving(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-xl w-full max-w-lg p-6 space-y-4 z-10">
                <h3 className="text-xl font-semibold text-gray-700">{eventData ? "Editar Evento" : "Novo Evento"}</h3>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input className="border p-2 rounded-lg" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" />
                        <input type="date" className="border p-2 rounded-lg" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        <input type="time" className="border p-2 rounded-lg" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                        <input className="border p-2 rounded-lg col-span-full" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Local" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {ministries.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => toggle(m.id)}
                                className={`px-3 py-1.5 rounded-full text-sm border ${selected.includes(m.id) ? "bg-[#38B2AC] text-white border-[#38B2AC]" : "border-gray-300 text-gray-600"
                                    }`}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg">
                            {saving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
