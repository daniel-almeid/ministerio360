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

// Escolha do plano: cada cartão é uma opção (clicar seleciona); "Ver detalhes" abre a lista de recursos
export default function RegisterPlanSelector({ plan, setPlan, cycle, setCycle, setShowDetails }: Props) {
    return (
        <div className="space-y-4">
            <CycleToggle value={cycle} onChange={setCycle} />

            <div role="radiogroup" aria-label="Plano" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANS.map((p) => {
                    const selected = plan === p.slug;
                    return (
                        <div
                            key={p.slug}
                            role="radio"
                            aria-checked={selected}
                            tabIndex={0}
                            onClick={() => setPlan(p.slug)}
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") {
                                    e.preventDefault();
                                    setPlan(p.slug);
                                }
                            }}
                            className={`cursor-pointer rounded-2xl border-[1.5px] p-4 transition outline-none focus-visible:ring-4 focus-visible:ring-[#38B2AC]/25 ${
                                selected ? "border-[#0F766E] bg-[#F0FAF8]" : "border-[#E3E8EF] bg-white hover:border-[#9EDBD5]"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                        selected ? "border-[#0F766E]" : "border-gray-300"
                                    }`}
                                >
                                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#0F766E]" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                        <h3 className="text-[17px] font-bold text-[#1E3A5F]">{p.name}</h3>
                                        <span className="text-[15px] font-extrabold text-gray-800">{priceLabel(p, cycle)}</span>
                                    </div>
                                    <p className="text-[13px] text-gray-500">{p.tagline}</p>
                                    {p.monthlyCents > 0 && cycle === "yearly" && (
                                        <p className="text-xs font-medium text-emerald-700">{monthlyEquivalent(p)}</p>
                                    )}
                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-[13px] font-semibold text-gray-700">{p.features[0]}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDetails(p.slug);
                                            }}
                                            className="text-[13px] font-bold text-[#0F766E] hover:underline"
                                        >
                                            Ver detalhes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
