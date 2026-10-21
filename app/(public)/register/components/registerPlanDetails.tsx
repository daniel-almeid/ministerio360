"use client";

import { getPlan } from "@/lib/plans";

type Props = {
    showDetails: string | null;
    setShowDetails: (v: string | null) => void;
};

export default function RegisterPlanDetails({ showDetails, setShowDetails }: Props) {
    if (!showDetails) return null;

    const plan = getPlan(showDetails);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl space-y-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    Detalhes do plano {plan.name}
                </h2>

                <ul className="space-y-2 text-gray-700">
                    {plan.features.map((f) => (
                        <li key={f}>• {f}</li>
                    ))}
                </ul>

                <button
                    onClick={() => setShowDetails(null)}
                    className="w-full mt-4 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
