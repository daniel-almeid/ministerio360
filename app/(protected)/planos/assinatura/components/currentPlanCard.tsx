"use client";

import { Crown, BadgeCheck, AlertTriangle } from "lucide-react";
import type { PlanDef, PlanSlug } from "../hook/useSubscription";

type Props = {
    currentPlan: PlanDef;
    price: number;
    planSlug: PlanSlug;
    isActive: boolean;
    formattedNextPayment: string | null;
};

export default function CurrentPlanCard({
    currentPlan,
    price,
    planSlug,
    isActive,
    formattedNextPayment,
}: Props) {
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

            {planSlug !== "free" && (
                <div className="flex flex-col items-start md:items-end gap-2">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                        {isActive ? (
                            <BadgeCheck className="w-3 h-3 mr-1" />
                        ) : (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {isActive ? "Assinatura ativa" : "Assinatura inativa"}
                    </span>

                    {formattedNextPayment && (
                        <p className="text-xs text-gray-500">
                            Renovação automática em{" "}
                            <span className="font-semibold">{formattedNextPayment}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
