'use client';

import { X } from "lucide-react";
import { useMemberForm } from "./memberModal/useMemberForm";
import { MinistrySelect } from "./memberModal/ministrySelect";

type Props = {
    member?: any;
    onClose: () => void;
    onSuccess: () => void;
};

export default function MemberModal({ member, onClose, onSuccess }: Props) {
    const { form, setForm, ministries, saving, handleSubmit } = useMemberForm(
        member,
        onSuccess,
        onClose
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-semibold text-gray-800 mb-5">
                    {member ? "Editar Membro" : "Novo Membro"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Nome</label>
                            <input
                                type="text"
                                placeholder="Nome completo"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
                                required
                            />
                        </div>

                        <MinistrySelect
                            value={form.ministry_id}
                            onChange={(v: string) => setForm({ ...form, ministry_id: v })}
                            options={ministries}
                        />

                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">E-mail</label>
                            <input
                                type="email"
                                placeholder="email@exemplo.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Telefone</label>
                            <input
                                type="text"
                                placeholder="(00) 00000-0000"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
                            />
                        </div>

                        <label className="text-sm text-gray-600 mb-1">Data de Nascimento</label>
                        <input
                            type="date"
                            value={form.birth_date}
                            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
                        />

                        <div className="flex items-center gap-2 mt-5 md:mt-7">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm({ ...form, is_active: e.target.checked })
                                }
                                className="accent-[#38B2AC] w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Ativo</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg bg-[#38B2AC] text-white hover:bg-[#319795] transition disabled:opacity-60"
                        >
                            {saving ? "Salvando..." : member ? "Salvar Alterações" : "Cadastrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
