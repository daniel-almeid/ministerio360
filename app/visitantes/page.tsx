"use client";

import { useEffect, useState, useMemo } from "react";
import { getVisitors } from "../services/visitors";
import { Visitor } from "../types/visitors";
import VisitorModal from "./visitorModal";
import VisitorDetailsDrawer from "./visitorDetailsDrawer";

export default function VisitantesPage() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

    async function loadVisitors() {
        setLoading(true);
        try {
            const data = await getVisitors();
            setVisitors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVisitors();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return visitors;
        return visitors.filter((v) =>
            [v.name, v.email, v.phone]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [search, visitors]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Visitantes</h2>

            <div className="flex justify-between items-center">
                <input
                    type="text"
                    className="px-4 py-2 border rounded-lg w-1/3"
                    placeholder="Buscar visitante..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                    onClick={() => setOpenModal(true)}
                >
                    + Registrar Visitante
                </button>
            </div>

            {/* 📋 Tabela de visitantes */}
            <div className="bg-white rounded-xl shadow-md">
                {loading ? (
                    <p className="text-gray-500 text-center py-6">Carregando...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">
                        Nenhum visitante encontrado.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="p-3">Nome</th>
                                <th className="p-3">Data da visita</th>
                                <th className="p-3">Status Follow-up</th>
                                <th className="p-3">É membro de alguma igreja?</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((v) => (
                                <tr
                                    key={v.id}
                                    className="border-b last:border-none hover:bg-gray-50"
                                >
                                    <td className="p-3">{v.name}</td>

                                    <td className="p-3">
                                        {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                                    </td>

                                    <td className="p-3">
                                        {v.followup_status === "pendente" && (
                                            <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                                                Pendente
                                            </span>
                                        )}
                                        {v.followup_status === "em_andamento" && (
                                            <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">
                                                Em andamento
                                            </span>
                                        )}
                                        {v.followup_status === "concluido" && (
                                            <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                                Concluído
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        {v.is_member ? (
                                            <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                                Sim
                                            </span>
                                        ) : (
                                            <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                                                Não
                                            </span>
                                        )}
                                    </td>

                                    <td
                                        className="p-3 text-right text-[#38B2AC] cursor-pointer hover:underline"
                                        onClick={() => setSelectedVisitor(v)}
                                    >
                                        Detalhes
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de registro */}
            {openModal && (
                <VisitorModal
                    onClose={() => setOpenModal(false)}
                    onSuccess={loadVisitors}
                />
            )}


            {selectedVisitor && (
                <VisitorDetailsDrawer
                    visitor={selectedVisitor}
                    onClose={() => setSelectedVisitor(null)}
                    onUpdated={loadVisitors}
                />
            )}
        </div>
    );
}
