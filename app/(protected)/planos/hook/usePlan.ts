"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePlan() {
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<string>("free");
    const [churchId, setChurchId] = useState<string | null>(null);
    const [scheduledChange, setScheduledChange] = useState<any>(null);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        const slug = user?.app_metadata?.plan_slug ?? "free";
        const cId = user?.app_metadata?.church_id ?? null;

        setCurrentPlan(slug);
        setChurchId(cId);

        if (cId) {
            const { data } = await supabase
                .from("subscription_changes")
                .select("*")
                .eq("church_id", cId)
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            setScheduledChange(data);
        }

        setLoading(false);
    }

    function isCurrent(slug: string) {
        return currentPlan === slug;
    }

    return {
        loading,
        currentPlan,
        churchId,
        scheduledChange,
        scheduledToPlan: scheduledChange?.to_plan ?? null,
        hasScheduledChange: !!scheduledChange,
        isCurrent
    };
}
