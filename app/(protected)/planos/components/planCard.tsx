"use client";

import type { PlanSlug } from "../assinatura/hook/useSubscription";

type Props = {
    slug: PlanSlug;
    name: string;
    price: string;
    features: string[];
    active: boolean;
    churchId: string | null;
    currentPlan: string;
};

export default function PlanCard({
    slug,
    name,
    price,
    features,
    active,
    churchId,
    currentPlan
}: Props) {

    async function contratarPlano() {
        try {
            const res = await fetch("/api/pagarme/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan_slug: slug })
            });

            const data = await res.json();

            if (!res.ok || !data.url) {
                alert("Erro ao criar checkout");
                console.error(data);
                return;
            }

            window.location.href = data.url; // REDIRECIONA PARA O PAGAR.ME
        } catch (err) {
            console.error(err);
            alert("Erro ao iniciar o pagamento.");
        }
    }

    return (
        <div
            className={`border rounded-2xl p-8 shadow-md flex flex-col justify-between ${active ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-white"
                }`}
        >
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
                <p className="text-3xl font-extrabold text-gray-800 mt-2">{price}</p>

                <ul className="mt-6 space-y-2 text-gray-700">
                    {features.map((f) => (
                        <li key={f}>• {f}</li>
                    ))}
                </ul>
            </div>

            {!active && (
                <button
                    onClick={contratarPlano}
                    className="mt-6 py-2 px-4 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                    Assinar
                </button>
            )}

            {active && (
                <div className="mt-6 py-2 px-4 rounded-xl bg-gray-300 text-gray-700 text-center font-semibold">
                    Plano atual
                </div>
            )}
        </div>
    );
}
