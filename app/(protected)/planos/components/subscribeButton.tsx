"use client";

import { useState } from "react";

type Props = {
    slug: string;
    active: boolean;
};

export default function SubscribeButton({ slug, active }: Props) {
    const [loading, setLoading] = useState(false);

    async function subscribe() {
        if (active || loading) return;

        setLoading(true);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan_slug: slug }),
            });

            const data = await res.json();

            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                alert("Erro ao iniciar assinatura.");
            }
        } catch {
            alert("Falha ao conectar com o servidor.");
        }

        setLoading(false);
    }

    const disabled = active || loading;

    return (
        <button
            disabled={disabled}
            onClick={subscribe}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition
                ${
                    active
                        ? "bg-gray-400 cursor-not-allowed"
                        : loading
                        ? "bg-teal-400 cursor-wait"
                        : "bg-teal-600 hover:bg-teal-700"
                }
            `}
        >
            {active ? "Plano atual" : loading ? "Processando..." : "Contratar plano"}
        </button>
    );
}
