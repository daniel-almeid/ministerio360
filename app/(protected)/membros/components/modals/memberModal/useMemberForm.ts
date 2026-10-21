import { useEffect, useState } from "react";
import { supabase } from "../../../../../../lib/supabaseClient";
import toast from "react-hot-toast";
import { normalizeMemberName, sameNameWarning, type SameNameMember } from "@/lib/memberNames";

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
    // Aviso de nome repetido; o nome que o usuário já confirmou que é outra pessoa
    const [nameWarning, setNameWarning] = useState<string | null>(null);
    const [confirmedName, setConfirmedName] = useState<string | null>(null);

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

    // Mudou o nome: o aviso antigo não vale mais
    useEffect(() => {
        if (nameWarning && normalizeMemberName(form.name) !== confirmedName) setNameWarning(null);
    }, [form.name]); // eslint-disable-line react-hooks/exhaustive-deps

    async function loadMinistries() {
        const { data, error } = await supabase
            .from("ministries")
            .select("id, name")
            .order("name", { ascending: true });

        if (error) toast.error("Erro ao carregar ministérios.");
        else setMinistries(data || []);
    }

    // Procura membros com o mesmo nome na igreja (se a busca falhar, não impede o cadastro)
    async function checkSameName(name: string) {
        const key = normalizeMemberName(name);
        if (key === confirmedName) return true;
        if (member && key === normalizeMemberName(member.name)) return true;

        const { data, error } = await supabase.rpc("find_members_by_name", {
            p_name: name,
            p_exclude: member?.id ?? null,
        });
        if (error || !data?.length) return true;

        setNameWarning(sameNameWarning(name, data as SameNameMember[]));
        setConfirmedName(key);
        return false;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error("O nome do membro é obrigatório!");
            return;
        }

        setSaving(true);

        if (!(await checkSameName(form.name))) {
            setSaving(false);
            return;
        }

        const payload = {
            ...form,
            name: form.name.trim().replace(/\s+/g, " "),
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

    return { form, setForm, ministries, saving, handleSubmit, nameWarning };
}
