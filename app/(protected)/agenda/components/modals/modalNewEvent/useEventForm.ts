"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export function useEventForm(eventData: any, onSuccess: () => void, onClose: () => void) {
    const [form, setFormState] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        setForm: (v: any) => setFormState((p) => ({ ...p, ...v }))
    });

    const [Ministries, setMinistries] = useState<any[]>([]);
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
        form.setForm({
            title: eventData.title,
            date: eventData.date?.slice(0, 10) || "",
            time: eventData.time || "",
            location: eventData.location || ""
        });

        const { data } = await supabase
            .from("event_ministries")
            .select("ministry_id")
            .eq("event_id", eventData.id);

        setSelected(data?.map((x: any) => x.ministry_id) || []);
    }

    function toggle(id: string) {
        setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    }

    async function submit(e: any) {
        e.preventDefault();
        setSaving(true);

        const { data } = await supabase.auth.getSession();
        const churchId = data.session?.user?.app_metadata?.church_id;

        const isoDate = form.date ? `${form.date}T12:00:00` : null;

        const payload = {
            title: form.title,
            date: isoDate,
            time: form.time,
            location: form.location || null,
            church_id: churchId
        };

        let eventId = eventData?.id || null;

        if (eventData) {
            await supabase.from("events").update(payload).eq("id", eventId);
        } else {
            const { data: created } = await supabase
                .from("events")
                .insert([payload])
                .select("id")
                .single();
            eventId = created?.id;
        }

        await supabase.from("event_ministries").delete().eq("event_id", eventId);

        if (selected.length > 0) {
            const rows = selected.map((m) => ({
                event_id: eventId,
                ministry_id: m
            }));

            await supabase.from("event_ministries").insert(rows);
        }

        toast.success("Salvo com sucesso");
        onSuccess();
        onClose();
        setSaving(false);
    }

    return {
        form,
        Ministries,
        selected,
        toggle,
        submit,
        saving
    };
}
