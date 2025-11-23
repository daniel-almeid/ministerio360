"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePlan() {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<string>("free");
    const [subscriptionActive, setSubscriptionActive] = useState<boolean>(true);

    useEffect(() => {
        async function loadPlan() {
            setLoading(true);

            const { data: sessionData } = await supabase.auth.getSession();
            const slug = sessionData.session?.user?.app_metadata?.plan_slug || "free";
            setPlan(slug);

            if (slug === "free") {
                setSubscriptionActive(true);
                setLoading(false);
                return;
            }

            const { data: sub } = await supabase
                .from("subscriptions")
                .select("status")
                .eq("church_id", sessionData.session?.user?.app_metadata?.church_id)
                .single();

            setSubscriptionActive(sub?.status === "authorized");
            setLoading(false);
        }

        loadPlan();
    }, []);

    return {
        loading,
        plan,
        subscriptionActive,
        isPremium: plan === "premium",
        isStandard: plan === "standard",
        isPaidPlan: plan !== "free",
    };
}
