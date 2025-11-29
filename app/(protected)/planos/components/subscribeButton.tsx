"use client";

import { useState } from "react";

type Props = {
    slug: string;
    active: boolean;
    churchId: string | null;
    currentPlan: string;
    scheduledToPlan: string | null;
    onReady: (pagarmePlanId: string) => void;
};

export default function SubscribeButton({
    slug,
    active,
    churchId,
    currentPlan,
    scheduledToPlan,
    onReady
}: Props) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        if (loading || active || !churchId) return;
        if (slug === currentPlan) return;

        setLoading(true);

        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan_slug: slug }),
        });

        const data = await res.json();
        setLoading(false);

        if (!data.ready) {
            alert("Erro ao preparar assinatura.");
            return;
        }

        onReady(data.pagarme_plan_id);
    }

    const scheduled = scheduledToPlan === slug;

    return (
        <button
            disabled={active || loading || scheduled}
            onClick={handleClick}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white ${
                active
                    ? "bg-gray-400 cursor-not-allowed"
                    : scheduled
                    ? "bg-yellow-500 cursor-not-allowed"
                    : loading
                    ? "bg-teal-400 cursor-wait"
                    : "bg-teal-600 hover:bg-teal-700"
            }`}
        >
            {active
                ? "Plano atual"
                : scheduled
                ? "Alteração agendada"
                : loading
                ? "Processando..."
                : "Assinar"}
        </button>
    );
}
