"use client";

import { Crown } from "lucide-react";
import type { BillingCycle, PlanDef, PlanSlug } from "../hook/useSubscription";
import { formatBRL } from "@/lib/plans";

type Props = {
    currentPlan: PlanDef;
    price: number;
    billingCycle: BillingCycle;
    planSlug: PlanSlug;
    isActive: boolean;
    formattedNextPayment: string | null;
    formattedExpiresOn: string | null;
};

export default function CurrentPlanCard({
    currentPlan,
    price,
    billingCycle,
    planSlug,
    isActive,
    formattedNextPayment,
    formattedExpiresOn,
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

                    {price > 0 ? (
                        <p className="text-sm text-gray-500 mt-1">
                            {formatBRL(Math.round(price * 100))} / {billingCycle === "yearly" ? "ano (plano anual)" : "mês"}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 mt-1">
                            Plano gratuito com recursos limitados
                        </p>
                    )}

                    {formattedExpiresOn && (
                        <p className="text-sm text-gray-500 mt-1">
                            Plano válido até <strong>{formattedExpiresOn}</strong>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
