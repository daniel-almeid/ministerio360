"use client";

import type { PlanDef, PlanSlug } from "../hook/useSubscription";

type Props = {
    plans: PlanDef[];
    currentSlug: PlanSlug;
    onSelectPlan?: (plan: PlanDef) => void;
};

export default function PlanComparison({ plans, currentSlug, onSelectPlan }: Props) {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan: PlanDef) => (
                <div
                    key={plan.slug}
                    className={`flex flex-col border rounded-2xl p-6 shadow-sm ${
                        plan.slug === currentSlug ? "border-teal-600" : "border-gray-200"
                    }`}
                >
                    <h3 className="text-lg font-bold">{plan.name}</h3>

                    <p className="mt-1 text-gray-600">
                        {plan.price === 0 ? "Gratuito" : `R$ ${plan.price.toFixed(2)} / mês`}
                    </p>

                    <ul className="mt-4 space-y-1 text-sm text-gray-700 flex-1">
                        {plan.features.map((f: string, i: number) => (
                            <li key={i} className="flex items-center gap-1">• {f}</li>
                        ))}
                    </ul>

                    {plan.slug !== currentSlug ? (
                        <button
                            className="mt-4 w-full py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                            onClick={() => onSelectPlan?.(plan)}
                        >
                            Assinar
                        </button>
                    ) : (
                        <button
                            disabled
                            className="mt-4 w-full py-2 bg-gray-300 text-gray-600 rounded-lg cursor-default"
                        >
                            Plano atual
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
