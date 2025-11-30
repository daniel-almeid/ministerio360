"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlanSlug } from "../types";

export function usePlan() {
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<PlanSlug>("free");

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);

        const { data: session } = await supabase.auth.getSession();
        const user = session.session?.user;

        const slug = (user?.app_metadata?.plan_slug ?? "free") as PlanSlug;
        setCurrentPlan(slug);

        setLoading(false);
    }

    function isCurrent(target: PlanSlug): boolean {
        return target === currentPlan;
    }

    return {
        loading,
        currentPlan,
        isCurrent,
    };
}
