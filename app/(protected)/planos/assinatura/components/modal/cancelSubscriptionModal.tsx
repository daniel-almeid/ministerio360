"use client";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    formattedExpiresOn: string | null;
};

export default function CancelSubscriptionModal({
    open,
    onClose,
    onConfirm,
    loading,
    formattedExpiresOn,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Cancelar assinatura
                </h2>

                <p className="text-sm text-gray-600">
                    Ao cancelar, nenhuma nova cobrança será feita.
                </p>

                {formattedExpiresOn && (
                    <p className="text-sm text-gray-700">
                        Você continuará com acesso ao plano atual até{" "}
                        <span className="font-semibold">{formattedExpiresOn}</span>.
                    </p>
                )}

                {!formattedExpiresOn && (
                    <p className="text-sm text-gray-700">
                        Você continuará com acesso ao plano atual até o fim do ciclo vigente.
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Voltar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? "Cancelando..." : "Confirmar cancelamento"}
                    </button>
                </div>
            </div>
        </div>
    );
}
