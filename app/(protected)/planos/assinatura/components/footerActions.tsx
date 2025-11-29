"use client";

type Props = {
    hasPaidPlan: boolean;
    isActive: boolean;
    onCancelClick: () => void;
};

export default function FooterActions({
    hasPaidPlan,
    isActive,
    onCancelClick,
}: Props) {
    return (
        <div className="pt-4 border-t border-gray-200">

            {/* Mensagem para quem ainda não assinou */}
            {!hasPaidPlan && (
                <p className="text-sm text-gray-600 text-center md:text-left mb-4">
                    Faça um upgrade no seu plano para aproveitar mais funcionalidades do Ministério360.
                </p>
            )}

            {/* Botão de cancelar assinatura */}
            {hasPaidPlan && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onCancelClick}
                        className="px-4 py-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Cancelar assinatura
                    </button>
                </div>
            )}
        </div>
    );
}
