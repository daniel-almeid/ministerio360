"use client";

import { useEffect, useState } from "react";
import { Visitor } from "../../types/visitors";
import VisitorModal from "../modals/newVisitor";

interface VisitorDetailsDrawerProps {
    visitor: Visitor;
    onClose: () => void;
    onUpdated: () => void;
}

export default function VisitorDetailsDrawer({ visitor, onClose, onUpdated }: VisitorDetailsDrawerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!visitor) return null;

    return (
        <>
            <div className={`fixed inset-0 z-50 flex justify-end transition-colors duration-300 ${isVisible ? "bg-black/40" : "bg-transparent"}`}>
                <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />
                <div className={`relative w-full sm:max-w-md bg-white h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
                    <div className="flex justify-between items-center border-b p-5 sticky top-0 bg-white z-10">
                        <h2 className="text-lg font-semibold text-gray-700">Detalhes do Visitante</h2>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-xl leading-none">✕</button>
                    </div>

                    <div className="p-6 space-y-5">
                        <div>
                            <p className="text-sm text-gray-500">Nome</p>
                            <p className="text-gray-800 font-medium">{visitor.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Data da visita</p>
                            <p className="text-gray-800">{new Date(visitor.visit_date).toLocaleDateString("pt-BR")}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">E-mail</p>
                            <p className="text-gray-800">{visitor.email || "-"}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Telefone</p>
                            <p className="text-gray-800">{visitor.phone || "-"}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">É membro de alguma igreja?</p>
                            <p className={`font-medium ${visitor.is_member ? "text-green-700" : "text-gray-700"}`}>{visitor.is_member ? "Sim" : "Não"}</p>
                        </div>
                    </div>

                    <div className="border-t p-4 flex justify-end gap-3 bg-gray-50 sticky bottom-0">
                        <button onClick={handleClose} className="px-4 py-2 rounded-lg border hover:bg-gray-100">Fechar</button>
                        <button onClick={() => setOpenEditModal(true)} className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]">Editar</button>
                    </div>
                </div>
            </div>

            {openEditModal && (
                <VisitorModal
                    onClose={() => setOpenEditModal(false)}
                    onSuccess={() => {
                        onUpdated();
                        handleClose();
                    }}
                    visitor={visitor}
                />
            )}
        </>
    );
}
