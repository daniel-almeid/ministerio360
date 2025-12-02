"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlanSlug } from "../types";

export function usePlan() {
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<PlanSlug>("free");
    const [active, setActive] = useState(false);

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

        setLoading(false);
    }

    function isCurrent(target: PlanSlug): boolean {
        return target === currentPlan;
    }

    return {
        loading,
        currentPlan,
        active,
        isCurrent,
    };
}
