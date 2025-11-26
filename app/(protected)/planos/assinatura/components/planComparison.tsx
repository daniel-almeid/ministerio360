"use client";

import type { PlanDef, PlanSlug } from "../hook/useSubscription";

type Props = {
    plans: PlanDef[];
    currentSlug: PlanSlug;
};

export default function PlanComparison({ plans, currentSlug }: Props) {
    return (
        <>
            <div className="h-px bg-gray-200" />

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                    Comparação de planos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => {
                        const isCurrent = plan.slug === currentSlug;
                        return (
                            <div
                                key={plan.slug}
                                className={`rounded-xl border p-4 bg-gray-50 flex flex-col gap-2 ${
                                    isCurrent
                                        ? "border-teal-500 bg-teal-50/60"
                                        : "border-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        {plan.name}
                                    </h4>
                                    {isCurrent && (
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-semibold">
                                            Atual
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600">
                                    {plan.price === 0
                                        ? "Gratuito"
                                        : `R$ ${plan.price.toFixed(2)} / mês`}
                                </p>

                                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex gap-1">
                                            <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-teal-500" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
