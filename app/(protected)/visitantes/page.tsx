"use client";

import { useEffect, useState, useMemo } from "react";
import { getVisitors } from "../../services/visitors";
import { Visitor } from "../../types/visitors";
import VisitorModal from "./visitorModal";
import VisitorDetailsDrawer from "./visitorDetailsDrawer";
import { Calendar, Info, UserCheck } from "lucide-react";

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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <input
                    type="text"
                    className="px-4 py-2 border rounded-lg w-full sm:w-1/3 focus:ring-2 focus:ring-[#38B2AC] outline-none"
                    placeholder="Buscar visitante..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                    onClick={() => setOpenModal(true)}
                >
                    + Registrar Visitante
                </button>
            </div>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <p className="text-gray-500 text-center py-10">Carregando visitantes...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">
                        Nenhum visitante encontrado.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col style={{ width: "30%" }} />
                                <col style={{ width: "20%" }} />
                                <col style={{ width: "25%" }} />
                                <col style={{ width: "15%" }} />
                                <col style={{ width: "10%" }} />
                            </colgroup>

                            <thead className="bg-gray-50/60 backdrop-blur-sm border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Data da visita
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Status Follow-up
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        É membro de alguma igreja?
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="group hover:bg-[#F9FAFB] transition-all duration-200"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Info className="w-4 h-4 text-[#38B2AC]" />
                                                {v.name}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                                {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {v.followup_status === "pendente" && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-yellow-700 bg-yellow-100">
                                                    Pendente
                                                </span>
                                            )}
                                            {v.followup_status === "em_andamento" && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100">
                                                    Em andamento
                                                </span>
                                            )}
                                            {v.followup_status === "concluido" && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-green-700 bg-green-100">
                                                    Concluído
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {v.is_member ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-green-700 bg-green-100">
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    Sim
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-100">
                                                    Não
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedVisitor(v)}
                                                className="inline-flex items-center gap-1 text-sm text-[#38B2AC] hover:text-[#2C7A7B] font-medium transition-all"
                                            >
                                                Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {openModal && (
                <VisitorModal onClose={() => setOpenModal(false)} onSuccess={loadVisitors} />
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
