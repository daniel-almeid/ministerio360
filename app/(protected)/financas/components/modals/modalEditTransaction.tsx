"use client";

import { useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { Loader2 } from "lucide-react";

type ModalEditTransactionProps = {
    transaction: {
        id: string;
        type: string;
        category: string;
        person_name: string;
        amount: number;
    };
    onClose: () => void;
    onUpdated: () => void;
};

export function ModalEditTransaction({
    transaction,
    onClose,
    onUpdated,
}: ModalEditTransactionProps) {
    const [form, setForm] = useState({
        type: transaction.type,
        category: transaction.category,
        person_name: transaction.person_name || "",
        amount: transaction.amount,
    });

    const [loading, setLoading] = useState(false);

    async function handleSave() {
        try {
            setLoading(true);

            const { error } = await supabase
                .from("transactions")
                .update({
                    type: form.type,
                    category: form.category,
                    person_name: form.person_name,
                    amount: parseFloat(String(form.amount)),
                })
                .eq("id", transaction.id);

            if (error) {
                console.error("Erro ao atualizar transação:", error);
                alert("Erro ao atualizar transação.");
                return;
            }

            onUpdated();
            onClose();
        } catch (err) {
            console.error("Erro inesperado:", err);
            alert("Erro inesperado ao atualizar transação.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "amount" ? Number(value) : value,
        }));
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Editar Transação
                </h2>

                <div className="space-y-4">
                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Tipo
                        </label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-emerald-400"
                        >
                            <option value="entrada">Entrada</option>
                            <option value="saida">Saída</option>
                        </select>
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Categoria
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-emerald-400"
                        />
                    </div>

                    {/* Nome da pessoa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nome da pessoa
                        </label>
                        <input
                            type="text"
                            name="person_name"
                            value={form.person_name}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-emerald-400"
                        />
                    </div>

                    {/* Valor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Valor
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-emerald-400"
                        />
                    </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                        ) : (
                            "Salvar"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
