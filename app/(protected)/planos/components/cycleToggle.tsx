"use client";

import { YEARLY_BADGE, type BillingCycle } from "@/lib/plans";

// Botão Mensal / Anual (2 meses grátis)
export default function CycleToggle({ value, onChange }: { value: BillingCycle; onChange: (v: BillingCycle) => void }) {
    return (
        <div className="flex justify-center">
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
                {(["monthly", "yearly"] as const).map((cycle) => (
                    <button
                        key={cycle}
                        type="button"
                        onClick={() => onChange(cycle)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-2 ${
                            value === cycle ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {cycle === "monthly" ? "Mensal" : "Anual"}
                        {cycle === "yearly" && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                {YEARLY_BADGE}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
