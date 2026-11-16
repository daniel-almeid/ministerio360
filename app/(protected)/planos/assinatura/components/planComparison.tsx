"use client";

import { formatBRL, monthlyEquivalent, priceLabel, type BillingCycle } from "@/lib/plans";
import { promoView } from "@/lib/promo";
import type { PlanDef, PlanSlug } from "../hook/useSubscription";

type Props = {
    plans: PlanDef[];
    cycle: BillingCycle;
    currentSlug: PlanSlug;
    currentCycle: BillingCycle;
    onSelectPlan?: (plan: PlanDef) => void;
    promo?: boolean; // Black Friday para esta igreja
};

export default function PlanComparison({ plans, cycle, currentSlug, currentCycle, onSelectPlan, promo = false }: Props) {
    return (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((plan: PlanDef) => {
                const isFree = plan.monthlyCents === 0;
                // Mesmo plano em outro ciclo (ex.: mensal → anual) pode ser assinado
                const isCurrent = plan.slug === currentSlug && (isFree || cycle === currentCycle);
                const offer = promo && !isFree && !isCurrent ? promoView(plan, cycle, formatBRL) : null;

                return (
                    <div
                        key={plan.slug}
                        className={`flex flex-col border rounded-2xl p-5 shadow-sm ${
                            plan.slug === currentSlug ? "border-teal-600" : "border-gray-200"
                        }`}
                    >
                        <h3 className="text-lg font-bold">{plan.name}</h3>

                        {offer ? (
                            <>
                                <p className="mt-1 text-xs text-gray-500 line-through">{offer.fullLabel}</p>
                                <p className="text-gray-800 font-bold">{offer.label}</p>
                                <p className="text-xs text-emerald-700">{offer.badge}</p>
                            </>
                        ) : (
                            <>
                                <p className="mt-1 text-gray-700 font-semibold">{isFree ? "Gratuito" : priceLabel(plan, cycle)}</p>
                                <p className="text-xs text-emerald-700 h-4">{!isFree && cycle === "yearly" ? monthlyEquivalent(plan) : ""}</p>
                            </>
                        )}

                        <ul className="mt-3 space-y-1 text-sm text-gray-700 flex-1">
                            {plan.features.map((f: string, i: number) => (
                                <li key={i} className={`flex items-start gap-1 ${i === 0 ? "font-semibold text-gray-900" : ""}`}>• {f}</li>
                            ))}
                        </ul>

                        {isCurrent ? (
                            <button disabled className="mt-4 w-full py-2 bg-gray-300 text-gray-600 rounded-lg cursor-default">
                                Plano atual
                            </button>
                        ) : isFree ? (
                            <button disabled className="mt-4 w-full py-2 bg-gray-100 text-gray-500 rounded-lg cursor-default">
                                Gratuito
                            </button>
                        ) : (
                            <button
                                className="mt-4 w-full py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                                onClick={() => onSelectPlan?.(plan)}
                            >
                                Assinar
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
