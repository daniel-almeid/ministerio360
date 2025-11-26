"use client";

import { Crown, BadgeCheck, AlertTriangle } from "lucide-react";
import type { PlanDef, PlanSlug } from "../hook/useSubscription";

type Props = {
    currentPlan: PlanDef;
    price: number;
    planSlug: PlanSlug;
    isActive: boolean;
    isCancelledButActive: boolean;
    formattedNextPayment: string | null;
    formattedExpiresOn: string | null;
};

export default function CurrentPlanCard({
    currentPlan,
    price,
    planSlug,
    isActive,
    isCancelledButActive,
    formattedNextPayment,
    formattedExpiresOn,
}: Props) {
    const showStatus = planSlug !== "free";

    let badgeText = "";
    let badgeClass = "";
    let icon: "active" | "warning" | null = null;
    let helperText: string | null = null;

    if (isActive) {
        badgeText = "Assinatura ativa";
        badgeClass =
            "bg-emerald-50 text-emerald-700 border-emerald-200";
        icon = "active";
        if (formattedNextPayment) {
            helperText = `Próxima cobrança em ${formattedNextPayment}`;
        }
    } else if (isCancelledButActive) {
        badgeText = "Assinatura cancelada";
        badgeClass =
            "bg-amber-50 text-amber-700 border-amber-200";
        icon = "warning";
        if (formattedExpiresOn) {
            helperText = `Seu plano permanece ativo até ${formattedExpiresOn}`;
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center">
                    <Crown className="text-teal-600 w-6 h-6" />
                </div>

                <div>
                    <p className="text-sm text-gray-600">Plano atual</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-teal-700 uppercase tracking-tight">
                        {currentPlan.name}
                    </h2>

                    {price > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            R$ {price.toFixed(2)} / mês
                        </p>
                    )}

                    {price === 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            Plano gratuito com recursos limitados
                        </p>
                    )}
                </div>
            </div>

            {showStatus && (
                <div className="flex flex-col items-start md:items-end gap-2">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}
                    >
                        {icon === "active" && (
                            <BadgeCheck className="w-3 h-3 mr-1" />
                        )}
                        {icon === "warning" && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {badgeText}
                    </span>

                    {helperText && (
                        <p className="text-xs text-gray-500">{helperText}</p>
                    )}
                </div>
            )}
        </div>
    );
}
