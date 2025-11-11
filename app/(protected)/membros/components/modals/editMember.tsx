"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "../../../../../lib/supabaseClient";
import { MinistrySelect } from "./memberModal/ministrySelect";

type EditMemberModalProps = {
    member: any;
    onClose: () => void;
    onSuccess: () => void;
};

export default function EditMemberModal({ member, onClose, onSuccess }: EditMemberModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        ministry_id: "",
        is_active: true,
        birth_date: "",
    });
    const [saving, setSaving] = useState(false);
    const [ministries, setMinistries] = useState<any[]>([]);

    useEffect(() => {
        loadMinistries();
        if (member) {
            setFormData({
                name: member.name || "",
                email: member.email || "",
                phone: member.phone || "",
                ministry_id: member.ministry_id || "",
                is_active: member.is_active,
                birth_date: member.birth_date
                    ? member.birth_date.split("T")[0]
                    : "",
            });
        }
    }, [member]);

    async function loadMinistries() {
        const { data, error } = await supabase.from("ministries").select("id, name").order("name");
        if (!error && data) setMinistries(data);
    }

    async function handleSave() {
        setSaving(true);
        const { error } = await supabase
            .from("members")
            .update({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                ministry_id: formData.ministry_id || null,
                is_active: formData.is_active,
                birth_date: formData.birth_date || null,
            })
            .eq("id", member.id);

        setSaving(false);

        if (error) {
            alert("Erro ao atualizar membro.");
            console.error(error);
        } else {
            onSuccess();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Membro</h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600">Nome</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-[#38B2AC] outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm text-gray-600">E-mail</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-[#38B2AC]"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-gray-600">Telefone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-[#38B2AC]"
                            />
                        </div>
                    </div>

                    <MinistrySelect
                        value={formData.ministry_id}
                        onChange={(v: string) => setFormData({ ...formData, ministry_id: v })}
                        options={ministries}
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) =>
                                    setFormData({ ...formData, is_active: e.target.checked })
                                }
                                className="accent-[#38B2AC]"
                            />
                            Ativo
                        </label>

                        <div>
                            <label className="text-sm text-gray-600">Data de Nascimento</label>
                            <input
                                type="date"
                                value={formData.birth_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, birth_date: e.target.value })
                                }
                                className="ml-2 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#38B2AC]"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-[#38B2AC] text-white hover:bg-[#319795] transition disabled:opacity-60"
                    >
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>
            </div>
        </div>
    );
}
