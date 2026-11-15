"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlanSlug } from "../types";

export function usePlan() {
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<PlanSlug>("free");
    const [active, setActive] = useState(false);
    // Assinatura ativa pela loja do celular (Google Play / App Store): aqui não assina por cartão
    const [paysThroughStore, setPaysThroughStore] = useState(false);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);

        const { data: session } = await supabase.auth.getSession();
        const user = session.session?.user;

        const slug = (user?.app_metadata?.plan_slug ?? "free") as PlanSlug;
        const subscriptionActive = user?.app_metadata?.subscription_active ?? false;

        setCurrentPlan(slug);
        setActive(subscriptionActive);

        // A igreja de quem está logado (o admin da plataforma enxerga todas)
        const { data: access } = await supabase.rpc("my_access");
        const churchId = (access as { church_id?: string } | null)?.church_id;
        const { data: church } = churchId
            ? await supabase
                  .from("church_profiles")
                  .select("billing_provider, subscription_active")
                  .eq("id", churchId)
                  .maybeSingle()
            : { data: null };
        setPaysThroughStore(
            !!church?.subscription_active && ["google_play", "app_store"].includes(church?.billing_provider ?? ""),
        );

        setLoading(false);
    }

    function isCurrent(target: PlanSlug): boolean {
        return target === currentPlan;
    }

    return {
        loading,
        currentPlan,
        active,
        paysThroughStore,
        isCurrent,
    };
}
