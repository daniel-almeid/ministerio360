"use client";

import CycleToggle from "@/app/(protected)/planos/components/cycleToggle";
import { PLANS, monthlyEquivalent, priceLabel, type BillingCycle, type PlanSlug } from "@/lib/plans";

type Props = {
    plan: PlanSlug;
    setPlan: (p: PlanSlug) => void;
    cycle: BillingCycle;
    setCycle: (c: BillingCycle) => void;
    setShowDetails: (v: string | null) => void;
};

export default function RegisterPlanSelector({ plan, setPlan, cycle, setCycle, setShowDetails }: Props) {
    return (
        <div>
            <label className="block text-base font-semibold text-gray-700 mb-3">Plano</label>

            <div className="mb-5">
                <CycleToggle value={cycle} onChange={setCycle} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {PLANS.map((p) => (
                    <div
                        key={p.slug}
                        className={`rounded-2xl border p-5 flex flex-col justify-between shadow-md transition ${plan === p.slug ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-white"
                            }`}
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">{p.name}</h3>

                            <p className="text-sm text-gray-600 mb-3">{p.tagline}</p>

                            <p className="text-2xl font-extrabold text-gray-800">{priceLabel(p, cycle)}</p>
                            <p className="text-xs text-emerald-700 font-medium h-4 mb-2">
                                {p.monthlyCents > 0 && cycle === "yearly" ? monthlyEquivalent(p) : ""}
                            </p>
                            <p className="text-sm font-semibold text-gray-700 mb-4">{p.features[0]}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setPlan(p.slug)}
                                type="button"
                                className={`w-full py-2 rounded-xl font-semibold ${plan === p.slug
                                    ? "bg-teal-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                Selecionar
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDetails(p.slug)}
                                className="w-full py-2 rounded-xl border border-gray-400 text-gray-700 text-sm"
                            >
                                Ver detalhes
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
