"use client";

import {
    Calendar,
    Info,
    UserCheck,
    MessageSquare,
    CheckCircle,
    Phone,
    Mail
} from "lucide-react";

export function TableBody({
    visitors,
    onSelect,
    onFollowup,
    onFinish,
    processingId,
    showArchived
}: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <colgroup>
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "10%" }} />
                </colgroup>

                <thead className="bg-gray-50/60 border-b border-gray-100">
                    <tr>
                        {[
                            "Nome",
                            "Data da visita",
                            "Status Follow-up",
                            "Contato",
                            "É membro?",
                            "Ações"
                        ].map((h) => (
                            <th
                                key={h}
                                className={`px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                                    h === "Ações" ? "text-center" : "text-left"
                                }`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {visitors.map((v: any) => (
                        <tr
                            key={v.id}
                            className="hover:bg-[#F9FAFB] transition-all duration-200"
                        >
                            <td className="px-5 py-3 font-medium text-gray-800">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-[#38B2AC]" />
                                    <span className="capitalize">{v.name}</span>
                                </div>
                            </td>

                            <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                    {v.visit_date
                                        ? new Date(v.visit_date).toLocaleDateString("pt-BR")
                                        : "—"}
                                </div>
                            </td>

                            <td className="px-5 py-3">
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

                            <td className="px-5 py-3 text-gray-700">
                                <div className="space-y-1">
                                    {v.phone ? (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#38B2AC]" />
                                            {v.phone}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Sem telefone</span>
                                    )}

                                    {v.email ? (
                                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                                            <Mail className="w-4 h-4 text-[#38B2AC]" />
                                            {v.email}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic text-xs">
                                            Sem e-mail
                                        </div>
                                    )}
                                </div>
                            </td>

                            <td className="px-5 py-3">
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

                            <td className="px-5 py-3 text-center">
                                <div className="flex justify-center gap-3">
                                    {!showArchived && (
                                        <>
                                            {v.followup_status === "pendente" && (
                                                <button
                                                    onClick={() => onFollowup(v)}
                                                    disabled={processingId === v.id}
                                                    className={`flex items-center gap-1 text-sm font-medium transition ${
                                                        processingId === v.id
                                                            ? "text-gray-400 cursor-not-allowed"
                                                            : "text-emerald-600 hover:text-emerald-700"
                                                    }`}
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Iniciar
                                                </button>
                                            )}

                                            {v.followup_status === "em_andamento" && (
                                                <button
                                                    onClick={() => onFinish(v)}
                                                    disabled={processingId === v.id}
                                                    className={`flex items-center gap-1 text-sm font-medium transition ${
                                                        processingId === v.id
                                                            ? "text-gray-400 cursor-not-allowed"
                                                            : "text-blue-600 hover:text-blue-700"
                                                    }`}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Finalizar
                                                </button>
                                            )}
                                        </>
                                    )}

                                    <button
                                        onClick={() => onSelect(v)}
                                        className="text-[#38B2AC] hover:text-[#2C7A7B] text-sm font-medium transition"
                                    >
                                        Detalhes
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
