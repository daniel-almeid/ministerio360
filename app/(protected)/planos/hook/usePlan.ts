"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePlan() {
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<string>("free");
    const [churchId, setChurchId] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);

        const { data } = await supabase.auth.getUser();
        const user = data.user;

        const slug = user?.app_metadata?.plan_slug ?? "free";
        const id = user?.app_metadata?.church_id ?? null;

        setCurrentPlan(slug);
        setChurchId(id);

        setLoading(false);
    }

    function isCurrent(slug: string) {
        return currentPlan === slug;
    }

    return {
        loading,
        currentPlan,
        churchId,
        isCurrent,
    };
}
