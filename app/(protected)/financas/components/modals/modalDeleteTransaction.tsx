"use client";

import { AlertTriangle, X } from "lucide-react";

type ModalDeleteTransactionProps = {
    onConfirm: () => void;
    onCancel: () => void;
};

export function ModalDeleteTransaction({ onConfirm, onCancel }: ModalDeleteTransactionProps) {
    function handleConfirm() {
        onConfirm();
        onCancel();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

            <div className="relative bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-6 animate-[fadeIn_.15s_ease-out]">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">Excluir transação</h3>
                        <p className="text-gray-600 mt-1">
                            Deseja realmente excluir esta transação? Esta ação não poderá ser desfeita.
                        </p>
                    </div>

                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}
