"use client";

type Props = {
    open: boolean;
    plan: string;
    onClose: () => void;
};

export default function RegisterSuccessModal({ open, plan, onClose }: Props) {
    if (!open) return null;

    const isPaidPlan = plan !== "free";

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6">
                
                <h2 className="text-3xl font-bold text-gray-800 text-center">
                    Conta criada com sucesso!
                </h2>

                <p className="text-gray-700 text-center">
                    Enviamos um e-mail para você confirmar sua conta.
                </p>

                {isPaidPlan && (
                    <p className="text-center text-teal-700 bg-teal-50 p-3 rounded-xl border border-teal-300">
                        Para utilizar as funcionalidades do plano, é necessário realizar o pagamento antes.
                    </p>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-4 py-3 bg-teal-600 text-white font-semibold rounded-xl"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
}
