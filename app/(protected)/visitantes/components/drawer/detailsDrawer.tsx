"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Mail,
    Phone,
    Info,
    UserCheck,
    MessageSquare,
    CheckCircle2,
    Archive,
} from "lucide-react";
import { Visitor } from "../../../../types/visitors";
import { supabase } from "@/lib/supabaseClient";
import { useFollowup } from "../../components/visitorTable/useFollowup";
import toast from "react-hot-toast";

interface VisitorDetailsDrawerProps {
    visitor: Visitor;
    onClose: () => void;
    onUpdated: () => void;
}

export default function VisitorDetailsDrawer({
    visitor,
    onClose,
    onUpdated,
}: VisitorDetailsDrawerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const { handleFollowup, handleFinish, processingId } = useFollowup();
    const [archiving, setArchiving] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    async function handleClickFollowup() {
        const updated = await handleFollowup(visitor);
        if (updated) {
            onUpdated();
            handleClose();
        }
    }

    async function handleClickFinish() {
        const updated = await handleFinish(visitor);
        if (updated) {
            onUpdated();
            handleClose();
        }
    }

    function handleArchive() {
        toast.custom((t) => (
            <div
                className={`bg-white shadow-lg border rounded-lg p-4 flex flex-col gap-3 w-72
                ${t.visible ? "animate-enter" : "animate-leave"}`}
            >
                <p className="text-gray-800 font-medium">Arquivar visitante?</p>

                <p className="text-sm text-gray-500 -mt-2">
                    Deseja realmente arquivar <strong>{visitor.name}</strong>?
                </p>

                <div className="flex justify-end gap-2 mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-sm rounded border text-gray-600 hover:bg-gray-100"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={() => confirmArchive(t.id)}
                        className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Arquivar
                    </button>
                </div>
            </div>
        ));
    }

    async function confirmArchive(toastId: string) {
        toast.dismiss(toastId);
        setArchiving(true);

        try {
            const { error } = await supabase
                .from("visitors")
                .update({ archived: true })
                .eq("id", visitor.id);

            if (error) throw error;

            toast.success("Visitante arquivado com sucesso!");
            onUpdated();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao arquivar visitante.");
        } finally {
            setArchiving(false);
        }
    }

    if (!visitor) return null;

    return (
        <>
            <div
                className={`fixed inset-0 z-50 flex justify-end transition-colors duration-300 ${
                    isVisible ? "bg-black/40" : "bg-transparent"
                }`}
            >
                <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

                <div
                    className={`relative w-full sm:max-w-md bg-white h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${
                        isVisible ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div className="flex justify-between items-center border-b p-5 sticky top-0 bg-white z-10">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Info className="w-5 h-5 text-[#38B2AC]" />
                            Detalhes do Visitante
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-160px)] custom-scrollbar">
                        <div>
                            <p className="text-sm text-gray-500">Nome</p>
                            <p className="text-lg font-semibold text-gray-800 capitalize">
                                {visitor.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Data da visita</p>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                    {new Date(visitor.visit_date).toLocaleDateString("pt-BR")}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Status Follow-up</p>
                                {visitor.followup_status === "pendente" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                        Pendente
                                    </span>
                                )}
                                {visitor.followup_status === "em_andamento" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                        Em andamento
                                    </span>
                                )}
                                {visitor.followup_status === "concluido" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                        Concluído
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Telefone</p>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-4 h-4 text-[#38B2AC]" />
                                {visitor.phone || "—"}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">E-mail</p>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="w-4 h-4 text-[#38B2AC]" />
                                {visitor.email || "—"}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">É membro?</p>
                            <p
                                className={`font-medium flex items-center gap-2 ${
                                    visitor.is_member ? "text-green-700" : "text-gray-700"
                                }`}
                            >
                                <UserCheck
                                    className={`w-4 h-4 ${
                                        visitor.is_member
                                            ? "text-green-600"
                                            : "text-gray-500"
                                    }`}
                                />
                                {visitor.is_member ? "Sim" : "Não"}
                            </p>
                        </div>

                        {visitor.notes && (
                            <div>
                                <p className="text-sm text-gray-500">Observações</p>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {visitor.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t p-4 bg-gray-50 flex justify-between items-center sticky bottom-0">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                        >
                            Fechar
                        </button>

                        <div className="flex gap-2">
                            {visitor.followup_status === "pendente" && (
                                <button
                                    disabled={processingId === visitor.id}
                                    onClick={handleClickFollowup}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Iniciar
                                </button>
                            )}

                            {visitor.followup_status === "em_andamento" && (
                                <button
                                    disabled={processingId === visitor.id}
                                    onClick={handleClickFinish}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Finalizar
                                </button>
                            )}

                            {!visitor.archived && (
                                <button
                                    onClick={handleArchive}
                                    disabled={archiving}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                >
                                    <Archive className="w-4 h-4" />
                                    Arquivar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
