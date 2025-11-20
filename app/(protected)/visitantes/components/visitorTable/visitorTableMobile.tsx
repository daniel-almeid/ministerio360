"use client";

import {
    Calendar,
    Info,
    UserCheck,
    MessageSquare,
    CheckCircle,
    Phone,
    Mail,
} from "lucide-react";
import Loading from "@/components/shared/loading";

export function VisitorTableMobile({
    visitors,
    onSelect,
    onFollowup,
    onFinish,
    processingId,
    showArchived,
    isLoading,
}: any) {
    if (isLoading)
        return (
            <div className="md:hidden flex justify-center py-8">
                <Loading />
            </div>
        );

    return (
        <div className="md:hidden space-y-4 mt-3">
            {visitors.map((v: any) => (
                <div
                    key={v.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                >
                    <div className="flex items-center gap-2 font-semibold mb-2">
                        <Info className="w-5 h-5 text-[#38B2AC]" />
                        <span className="capitalize text-gray-800">{v.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                        <Calendar className="w-4 h-4 text-[#38B2AC]" />
                        {v.visit_date ? v.visit_date.split("-").reverse().join("/") : "-"}
                    </div>

                    <div className="mb-1">
                        {v.followup_status === "pendente" && (
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-yellow-700 bg-yellow-100">
                                Pendente
                            </span>
                        )}
                        {v.followup_status === "em_andamento" && (
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100">
                                Em andamento
                            </span>
                        )}
                        {v.followup_status === "concluido" && (
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-green-700 bg-green-100">
                                Concluído
                            </span>
                        )}
                    </div>

                    <div className="space-y-1 mb-3 text-gray-700">
                        {v.phone ? (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#38B2AC]" />
                                <span>{v.phone}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400 italic">Sem telefone</span>
                        )}

                        {v.email ? (
                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                                <Mail className="w-4 h-4 text-[#38B2AC]" />
                                <span>{v.email}</span>
                            </div>
                        ) : (
                            <div className="text-gray-400 italic text-xs">Sem e-mail</div>
                        )}
                    </div>

                    <div className="mb-3">
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
                    </div>

                    {!showArchived && (
                        <div className="flex justify-end gap-4 pt-1">
                            {v.followup_status === "pendente" && (
                                <button
                                    onClick={() => onFollowup(v)}
                                    disabled={processingId === v.id}
                                    className={`flex items-center gap-1 text-sm font-medium ${processingId === v.id
                                            ? "text-gray-400"
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
                                    className={`flex items-center gap-1 text-sm font-medium ${processingId === v.id
                                            ? "text-gray-400"
                                            : "text-blue-600 hover:text-blue-700"
                                        }`}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Finalizar
                                </button>
                            )}

                            <button
                                onClick={() => onSelect(v)}
                                className="text-[#38B2AC] hover:text-[#2C7A7B] text-sm font-medium"
                            >
                                Detalhes
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
