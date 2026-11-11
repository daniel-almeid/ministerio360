"use client";

import { Check, X } from "lucide-react";
import { getPlan } from "@/lib/plans";

type Props = {
    showDetails: string | null;
    setShowDetails: (v: string | null) => void;
};

export default function RegisterPlanDetails({ showDetails, setShowDetails }: Props) {
    if (!showDetails) return null;

    const plan = getPlan(showDetails);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-xl space-y-5">
                <div className="flex items-start gap-3">
                    <h2 className="flex-1 text-2xl font-extrabold text-[#1E3A5F]">Detalhes do plano {plan.name}</h2>
                    <button
                        type="button"
                        onClick={() => setShowDetails(null)}
                        aria-label="Fechar"
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <ul className="space-y-2.5 text-gray-700">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E6F7F5] text-[#0F766E]">
                                <Check className="h-3.5 w-3.5" />
                            </span>
                            {f}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => setShowDetails(null)}
                    className="w-full min-h-[48px] bg-[#0F766E] text-white font-bold rounded-[14px] hover:bg-[#0D5C56] transition"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
