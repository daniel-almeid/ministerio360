"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
    slug: string;
    active: boolean;
    churchId: string | null;
    currentPlan: string;
    scheduledToPlan: string | null;
};

export default function SubscribeButton({
    slug,
    active,
    churchId,
    currentPlan,
    scheduledToPlan
}: Props) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        if (loading || active || !churchId) return;
        if (slug === currentPlan) return;

        setLoading(true);

        if (slug === "free") {
            await supabase.rpc("request_plan_change", {
                p_church_id: churchId,
                p_to_plan: "free",
                p_apply_at: null,
                p_mp_preference_id: null
            });

            setLoading(false);
            window.location.reload();
            return;
        }

        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan_slug: slug })
        });

        const data = await res.json();

        if (data.preference_id) {
            await supabase.rpc("request_plan_change", {
                p_church_id: churchId,
                p_to_plan: slug,
                p_mp_preference_id: data.preference_id,
                p_apply_at: null
            });
        }

        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        }

        setLoading(false);
    }

    const scheduled = scheduledToPlan === slug;

    return (
        <button
            disabled={active || loading || scheduled}
            onClick={handleClick}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition ${
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
                : "Contratar plano"}
        </button>
    );
}
