"use client";

type PlanSlug = "free" | "standard" | "premium";

type Props = {
    plan: PlanSlug;
    setPlan: (p: PlanSlug) => void;
    setShowDetails: (v: string | null) => void;
};

export default function RegisterPlanSelector({ plan, setPlan, setShowDetails }: Props) {
    return (
        <div>
            <label className="block text-base font-semibold text-gray-700 mb-3">Plano</label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {["free", "standard", "premium"].map((p) => (
                    <div
                        key={p}
                        className={`rounded-2xl border p-6 flex flex-col justify-between shadow-md transition ${plan === p ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-white"
                            }`}
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                {p === "free" ? "Grátis" : p === "standard" ? "Padrão" : "Premium"}
                            </h3>

                            <p className="text-sm text-gray-600 mb-3">
                                {p === "free"
                                    ? "Recursos básicos"
                                    : p === "standard"
                                        ? "Funcionalidades avançadas"
                                        : "Acesso completo"}
                            </p>

                            <p className="text-3xl font-extrabold text-gray-800 mb-4">
                                {p === "free" ? "R$ 0" : "R$ 1,00"}
                                <span className="text-base font-medium">/mês</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setPlan(p as PlanSlug)}
                                type="button"
                                className={`w-full py-2 rounded-xl font-semibold ${plan === p
                                        ? "bg-teal-600 text-white"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                Selecionar
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDetails(p)}
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
