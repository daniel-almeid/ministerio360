"use client";

type Props = {
    hasPaidPlan: boolean;
    hasAutoRenewal: boolean;
    renewalCanceled: boolean;
    formattedExpiresOn: string | null;
    onCancelClick: () => void;
};

export default function FooterActions({
    hasPaidPlan,
    hasAutoRenewal,
    renewalCanceled,
    formattedExpiresOn,
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

            {/* Renovação já cancelada: mostra até quando vale */}
            {hasPaidPlan && renewalCanceled && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    A renovação automática foi cancelada. O plano continua ativo até{" "}
                    <strong>{formattedExpiresOn ?? "o fim do período pago"}</strong>; depois, a igreja passa para o
                    plano Grátis. Para continuar, é só assinar de novo um dos planos acima.
                </p>
            )}

            {/* Plano liberado sem cobrança automática (ex.: pelo suporte) */}
            {hasPaidPlan && !renewalCanceled && !hasAutoRenewal && (
                <p className="text-sm text-gray-600">Este plano não tem renovação automática.</p>
            )}

            {/* Cancelar a renovação */}
            {hasPaidPlan && !renewalCanceled && hasAutoRenewal && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onCancelClick}
                        className="px-4 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                        Cancelar assinatura
                    </button>
                </div>
            )}
        </div>
    );
}
