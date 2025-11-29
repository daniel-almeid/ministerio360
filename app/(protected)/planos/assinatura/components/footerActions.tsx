"use client";

type Props = {
    hasPaidPlan: boolean;
    isActive: boolean;
    isCancelledButActive: boolean;
    onCancelClick: () => void;
    onUpgradeClick?: () => void;
};

export default function FooterActions({
    hasPaidPlan,
    isActive,
    isCancelledButActive,
    onCancelClick,
    onUpgradeClick,
}: Props) {
    const canCancel = hasPaidPlan && isActive;

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
                {hasPaidPlan && (
                    <p className="text-sm text-gray-600">
                        Gerencie sua assinatura ou altere seu plano a qualquer
                        momento.
                    </p>
                )}

                {!hasPaidPlan && (
                    <p className="text-sm text-gray-600">
                        Faça upgrade para liberar mais recursos no Ministério360.
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
                {hasPaidPlan && (
                    <>
                        <button
                            type="button"
                            onClick={onCancelClick}
                            disabled={!canCancel}
                            className="px-4 py-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            {isCancelledButActive
                                ? "Assinatura cancelada"
                                : "Cancelar assinatura"}
                        </button>

                        {onUpgradeClick && (
                            <button
                                type="button"
                                onClick={onUpgradeClick}
                                className="px-4 py-2 rounded-lg bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
                            >
                                Alterar plano
                            </button>
                        )}
                    </>
                )}

                {!hasPaidPlan && onUpgradeClick && (
                    <button
                        type="button"
                        onClick={onUpgradeClick}
                        className="px-4 py-2 rounded-lg bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                        Contratar um plano
                    </button>
                )}
            </div>
        </div>
    );
}
