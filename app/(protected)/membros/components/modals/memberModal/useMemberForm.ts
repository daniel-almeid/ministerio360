import { useEffect, useState } from "react";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast from "react-hot-toast";

export function useMemberForm(member: any, onSuccess: () => void, onClose: () => void) {
    const [form, setForm] = useState({
        name: "",
        ministry_id: "",
        email: "",
        phone: "",
        is_active: true,
        birth_date: "",
    });
    const [saving, setSaving] = useState(false);
    const [ministries, setMinistries] = useState<any[]>([]);

    useEffect(() => {
        loadMinistries();
        if (member) {
            setForm({
                name: member.name,
                ministry_id: member.ministry_id || "",
                email: member.email || "",
                phone: member.phone || "",
                is_active: member.is_active,
                birth_date: member.birth_date ? member.birth_date.split("T")[0] : "",
            });
        }
    }, [member]);

    async function loadMinistries() {
        const { data, error } = await supabase
            .from("ministries")
            .select("id, name")
            .order("name", { ascending: true });

        if (error) toast.error("Erro ao carregar ministérios.");
        else setMinistries(data || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        if (!form.name.trim()) {
            toast.error("O nome do membro é obrigatório!");
            setSaving(false);
            return;
        }

        const payload = {
            ...form,
            ministry_id: form.ministry_id || null,
            email: form.email || null,
            phone: form.phone || null,
            birth_date: form.birth_date || null,
        };

        const query = member
            ? supabase.from("members").update(payload).eq("id", member.id)
            : supabase.from("members").insert([payload]);

        const { error } = await query;
        setSaving(false);

        if (error) toast.error("Erro ao salvar membro.");
        else {
            toast.success(member ? "Membro atualizado!" : "Membro cadastrado!");
            onSuccess();
            onClose();
        }
    }

    return { form, setForm, ministries, saving, handleSubmit };
}
