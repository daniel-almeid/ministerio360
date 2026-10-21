"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ModalShell, SecondaryButton } from "../../financas/components/finance/ui";

// Confirmação simples (remover usuário, cancelar convite...)
export function ConfirmModal({
    title,
    text,
    confirmLabel,
    danger,
    onConfirm,
    onClose,
}: {
    title: string;
    text: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => Promise<string | null>; // devolve erro
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function confirm() {
        setLoading(true);
        setError(null);
        const message = await onConfirm();
        setLoading(false);
        if (message) setError(message);
    }

    return (
        <ModalShell
            title={title}
            icon={AlertTriangle}
            onClose={onClose}
            error={error}
            footer={
                <>
                    <SecondaryButton onClick={onClose} disabled={loading}>
                        Voltar
                    </SecondaryButton>
                    <button
                        onClick={confirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                            danger ? "bg-red-600 hover:bg-red-700" : "bg-[#38B2AC] hover:bg-[#319795]"
                        }`}
                    >
                        {loading ? "Aguarde..." : confirmLabel}
                    </button>
                </>
            }
        >
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
        </ModalShell>
    );
}
