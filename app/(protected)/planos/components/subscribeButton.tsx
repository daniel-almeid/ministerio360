"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    slug: string;
    active: boolean;
    currentPlan: string;
};

export default function SubscribeButton({
    slug,
    active,
    currentPlan,
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        if (loading || active) return;
        if (slug === currentPlan) {
            router.push(`/planos/assinatura?plan=${slug}`);
            return;
        }

        router.push(`/planos/assinatura?plan=${slug}`);
    }

    const isSelected = slug === currentPlan;

    return (
        <button
            disabled={active || loading}
            onClick={handleClick}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white ${
                active
                    ? "bg-gray-400 cursor-not-allowed"
                    : loading
                    ? "bg-teal-400 cursor-wait"
                    : "bg-teal-600 hover:bg-teal-700"
            }`}
        >
            {active
                ? "Plano atual"
                : isSelected
                ? "Pagar plano"
                : loading
                ? "Processando..."
                : "Assinar"}
        </button>
    );
}
