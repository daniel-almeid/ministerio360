"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { Ministry, Member } from "../../../../../types/agenda";

export function useScaleForm(onSuccess: () => void, onClose: () => void) {
    const [form, setFormState] = useState({
        date: "",
        event: "",
        responsible: "",
        ministriesSelected: [] as string[],
        assignments: {} as Record<string, string[]>,
        setForm: (v: any) => setFormState((p) => ({ ...p, ...v }))
    });

    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const { data: mins } = await supabase.from("ministries").select("id, name").order("name");
        const { data: mems } = await supabase.from("members").select("id, name, ministry_id").order("name");

        setMinistries(mins || []);
        setMembers(mems || []);
    }

    function toggleMinistry(id: string) {
        const exists = form.ministriesSelected.includes(id);

        if (exists) {
            const updated = form.ministriesSelected.filter((m) => m !== id);
            const assignments = { ...form.assignments };
            delete assignments[id];

            form.setForm({ ministriesSelected: updated, assignments });
        } else {
            form.setForm({ ministriesSelected: [...form.ministriesSelected, id] });
        }
    }

    function toggleMember(ministryId: string, memberId: string) {
        const list = form.assignments[ministryId] || [];
        const selected = list.includes(memberId);

        form.setForm({
            assignments: {
                ...form.assignments,
                [ministryId]: selected
                    ? list.filter((id) => id !== memberId)
                    : [...list, memberId]
            }
        });
    }

    async function submit(e: any) {
        e.preventDefault();
        setSaving(true);

        const { data: session } = await supabase.auth.getSession();
        const churchId = session.session?.user?.app_metadata?.church_id;

        const selectedMin = ministries
            .filter((m) => form.ministriesSelected.includes(m.id))
            .map((m) => ({ id: m.id, name: m.name }));

        const isoDate = form.date ? `${form.date}T12:00:00` : null;

        const { data: scale, error } = await supabase
            .from("scales")
            .insert({
                date: isoDate,
                event_name: form.event,
                responsible: form.responsible,
                ministries: selectedMin,
                church_id: churchId
            })
            .select("id")
            .single();

        if (error || !scale) {
            toast.error("Erro ao criar escala");
            setSaving(false);
            return;
        }

        const insertRows: any[] = [];

        Object.entries(form.assignments).forEach(([ministryId, ids]) => {
            ids.forEach((memberId) => {
                insertRows.push({
                    scale_id: scale.id,
                    ministry_id: ministryId,
                    member_id: memberId,
                    church_id: churchId
                });
            });
        });

        if (insertRows.length > 0) {
            await supabase.from("scale_assignments").insert(insertRows);
        }

        toast.success("Escala criada");
        onSuccess();
        onClose();
        setSaving(false);
    }

    return {
        form,
        ministries,
        members,
        toggleMinistry,
        toggleMember,
        submit,
        saving
    };
}
