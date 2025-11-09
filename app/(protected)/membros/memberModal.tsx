'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import toast from "react-hot-toast";

type Ministry = {
    id: string;
    name: string;
};

type Props = {
    member?: {
        id: string;
        name: string;
        ministry_id: string | null;
        email: string | null;
        phone: string | null;
        is_active: boolean;
        joined_at: string | null;
    } | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function MemberModal({ member, onClose, onSuccess }: Props) {
    const [form, setForm] = useState({
        name: "",
        ministry_id: "",
        email: "",
        phone: "",
        is_active: true,
        joined_at: "",
    });
    const [saving, setSaving] = useState(false);
    const [ministries, setMinistries] = useState<Ministry[]>([]);

    // Carregar ministérios e preencher formulário se for edição
    useEffect(() => {
        loadMinistries();

        if (member) {
            setForm({
                name: member.name,
                ministry_id: member.ministry_id || "",
                email: member.email || "",
                phone: member.phone || "",
                is_active: member.is_active,
                joined_at: member.joined_at ? member.joined_at.split("T")[0] : "",
            });
        }
    }, [member]);

    async function loadMinistries() {
        const { data, error } = await supabase
            .from("ministries")
            .select("id, name")
            .order("name", { ascending: true });

        if (error) {
            console.error("Erro ao carregar ministérios:", error.message);
            toast.error("Erro ao carregar ministérios.");
        }

        setMinistries(data || []);
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
            joined_at: form.joined_at ? new Date(form.joined_at).toISOString() : null,
        };

        let error;
        if (member) {
            const { error: updateError } = await supabase
                .from("members")
                .update(payload)
                .eq("id", member.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from("members").insert([payload]);
            error = insertError;
        }

        setSaving(false);

        if (error) {
            console.error("Erro ao salvar membro:", error.message);
            toast.error("Erro ao salvar membro. Tente novamente.");
        } else {
            toast.success(
                member ? "Membro atualizado com sucesso!" : "Membro cadastrado com sucesso!"
            );
            onSuccess();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-fadeIn">
                <h3 className="text-xl font-semibold text-gray-700">
                    {member ? "Editar Membro" : "Novo Membro"}
                </h3>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nome */}
                        <input
                            type="text"
                            placeholder="Nome"
                            className="border p-2 rounded-lg"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />

                        {/* Ministério */}
                        <select
                            className="border p-2 rounded-lg"
                            value={form.ministry_id}
                            onChange={(e) => setForm({ ...form, ministry_id: e.target.value })}
                        >
                            <option value="">Sem ministério</option>
                            {ministries.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>

                        {/* Email */}
                        <input
                            type="email"
                            placeholder="Email"
                            className="border p-2 rounded-lg"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />

                        {/* Telefone */}
                        <input
                            type="text"
                            placeholder="Telefone"
                            className="border p-2 rounded-lg"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />

                        {/* Data de entrada */}
                        <input
                            type="date"
                            className="border p-2 rounded-lg"
                            value={form.joined_at}
                            onChange={(e) => setForm({ ...form, joined_at: e.target.value })}
                        />

                        {/* Checkbox de ativo */}
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm({ ...form, is_active: e.target.checked })
                                }
                            />
                            Ativo
                        </label>
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
                            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50"
                        >
                            {saving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
