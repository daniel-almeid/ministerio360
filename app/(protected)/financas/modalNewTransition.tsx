"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import toast from "react-hot-toast";

export function ModalNovaTransacao({ onClose, onSuccess }: any) {
    const [type, setType] = useState("entrada");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const categoriasPadrao = [
        "Dízimo",
        "Oferta",
        "Compras",
        "Contas",
        "Eventos",
        "Doações",
        "Missões",
    ];

    async function handleSave() {
        if (!category || !amount) {
            toast.error("Preencha todos os campos obrigatórios!");
            return;
        }

        setLoading(true);

        try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("Erro ao obter sessão:", sessionError.message);
                toast.error("Erro ao validar sessão. Faça login novamente.");
                throw new Error("Falha ao obter sessão.");
            }

            const session = sessionData?.session;
            if (!session) {
                toast.error("Sessão expirada. Faça login novamente.");
                return;
            }

            // Monta o payload
            const payload = {
                type,
                category,
                amount: parseFloat(amount),
                note,
            };

            const { error } = await supabase.from("transactions").insert(payload);

            if (error) {
                console.error("Erro ao salvar transação:", error);
                toast.error("Erro ao salvar transação.");
                return;
            }

            toast.success("Transação salva com sucesso!");
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error("Erro inesperado:", err.message);
            toast.error("Erro inesperado: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
                <h2 className="text-xl font-semibold mb-4">Nova Transação</h2>

                <div className="space-y-3">
                    {/* Tipo */}
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

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Selecione uma categoria</option>
                            {categoriasPadrao.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                            <option value="outra">Outra...</option>
                        </select>

                        {category === "outra" && (
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 mt-2"
                                placeholder="Digite o nome da categoria"
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Pessoa ou motivo */}
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

                    {/* Valor */}
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

                    {/* Observação */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Observação</label>
                        <textarea
                            className="w-full border rounded-lg px-3 py-2"
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ex: Oferta referente ao culto de domingo"
                        />
                    </div>
                </div>

                {/* Botões */}
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
                        className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
