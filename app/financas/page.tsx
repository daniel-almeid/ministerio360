"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ModalNovaTransacao } from "../../components/modalNewTransition";

export default function FinancasPage() {
    const [transacoes, setTransacoes] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("todas");

    async function carregarTransacoes(tipo = "todas") {
        setLoading(true);
        let query = supabase.from("transactions").select("*").order("created_at", { ascending: false });

        if (tipo !== "todas") {
            query = query.eq("type", tipo);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erro ao carregar transações:", error);
        } else {
            setTransacoes(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        carregarTransacoes(filtro);
    }, [filtro]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Finanças</h2>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <h3 className="font-semibold text-gray-700">Transações</h3>

                    <div className="flex items-center gap-3">
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm text-gray-600"
                        >
                            <option value="todas">Todas</option>
                            <option value="entrada">Entradas</option>
                            <option value="saida">Saídas</option>
                        </select>

                        <button
                            onClick={() => setOpenModal(true)}
                            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                        >
                            + Nova Transação
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-center py-6">Carregando...</p>
                ) : transacoes.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">
                        Nenhuma transação encontrada.
                    </p>
                ) : (
                    <table className="w-full text-sm border-separate border-spacing-y-1">
                        <thead>
                            <tr className="text-gray-500 border-b text-left">
                                <th className="pb-2 px-3">Tipo</th>
                                <th className="pb-2 px-3">Categoria</th>
                                <th className="pb-2 px-3">Valor</th>
                                <th className="pb-2 px-3">Pessoa/Motivo</th>
                                <th className="pb-2 px-3">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transacoes.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-b last:border-none hover:bg-gray-50 transition-colors"
                                >
                                    <td
                                        className={`py-2 px-3 capitalize font-medium ${t.type === "entrada" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {t.type}
                                    </td>
                                    <td className="py-2 px-3 capitalize">{t.category}</td>
                                    <td className="py-2 px-3">
                                        R$ {Number(t.amount).toFixed(2).replace(".", ",")}
                                    </td>
                                    <td className="py-2 px-3 capitalize">
                                        {t.details || "-"}
                                    </td>
                                    <td className="py-2 px-3 text-gray-500">
                                        {new Date(t.created_at).toLocaleDateString("pt-BR")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {openModal && (
                <ModalNovaTransacao
                    onClose={() => setOpenModal(false)}
                    onSuccess={() => carregarTransacoes(filtro)}
                />
            )}
        </div>
    );
}