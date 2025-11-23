"use client";

type Props = {
    open: boolean;
    onClose: () => void;
};

export function UpgradeRequiredModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Recurso disponível apenas no plano Premium
                </h2>

                <p className="text-gray-600 mb-6">
                    Para acessar esta funcionalidade, faça upgrade do seu plano.
                </p>

                <button
                    onClick={() => window.location.href = "/planos"}
                    className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition"
                >
                    Ver planos
                </button>

                <button
                    onClick={onClose}
                    className="w-full mt-3 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
