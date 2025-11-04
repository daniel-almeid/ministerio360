"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        setLoading(true);

        try {
            // 🔹 1. Atualiza o token de autenticação
            const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
                console.warn("Erro ao atualizar sessão:", refreshError.message);
            }

            const session = refreshed?.session;
            if (!session || !session.access_token) {
                throw new Error("Sessão inválida ou expirada. Faça login novamente.");
            }

            // 🔹 2. Sincroniza PostgREST
            await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
            });

            console.log("JWT ativo no insert:", session.user?.app_metadata);

            // 🔹 3. Monta o payload
            const payload = {
                type,
                category,
                amount: parseFloat(amount),
                note,
            };

            console.log("Enviando payload:", payload);

            // 🔹 4. Envio manual via fetch (com header Authorization correto)
            const restUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/transactions`;
            const res = await fetch(restUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    Prefer: "return=minimal",
                },
                body: JSON.stringify([payload]),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("Erro ao salvar transação:", errText);
                alert("Erro ao salvar transação: " + errText);
            } else {
                console.log("✅ Transação salva com sucesso!");
                onSuccess?.();
                onClose();
            }
        } catch (err: any) {
            console.error("Erro inesperado:", err.message);
            alert("Erro inesperado: " + err.message);
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
