"use client";

type Props = {
    open: boolean;
    onClose: () => void;
    formattedExpiresOn: string | null;
};

export default function CancelSubscriptionModal({
    open,
    onClose,
    formattedExpiresOn,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">

                <h2 className="text-xl font-semibold text-gray-800">
                    Cancelamento de assinatura
                </h2>

                <p className="text-gray-600 leading-relaxed">
                    O cancelamento tradicional não está disponível.  
                    Seu plano é pré-pago e permanecerá ativo até:
                </p>

                <p className="text-center text-lg font-semibold text-teal-700">
                    {formattedExpiresOn || "Data não encontrada"}
                </p>

                <p className="text-gray-600 leading-relaxed">
                    Após essa data, sua conta retornará automaticamente ao plano gratuito.
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
}
