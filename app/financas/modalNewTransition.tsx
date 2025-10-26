"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function ModalNovaTransacao({ onClose, onSuccess }: any) {
    const [type, setType] = useState("entrada");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        setLoading(true);

        const { error } = await supabase.from("transactions").insert([
            {
                type,
                category,
                amount: parseFloat(amount),
                details: note,
            },
        ]);

        setLoading(false);
        if (error) alert("Erro ao salvar: " + error.message);
        else {
            onSuccess?.();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
                <h2 className="text-xl font-semibold mb-4">Nova Transação</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="entrada">Entrada</option>
                            <option value="saida">Saída</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Ex: Dízimo, Oferta..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            {type === "entrada" ? "Nome da pessoa" : "Motivo da saída"}
                        </label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={
                                type === "entrada"
                                    ? "Ex: João Silva"
                                    : "Ex: Compra de materiais para evento"
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Valor</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg px-3 py-2"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 150.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Observação</label>
                        <textarea
                            className="w-full border rounded-lg px-3 py-2"
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                    >
                        {loading ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
