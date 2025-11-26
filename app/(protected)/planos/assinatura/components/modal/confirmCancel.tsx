"use client";

import { X } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ConfirmCancelModal({ open, onClose, onConfirm }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Cancelar assinatura
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Deseja realmente cancelar sua assinatura? Você perderá o acesso aos
                    recursos do plano assim que o ciclo atual terminar.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                    >
                        Manter assinatura
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                    >
                        Cancelar assinatura
                    </button>
                </div>
            </div>
        </div>
    );
}
