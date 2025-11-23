"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type PlanSlug = "free" | "standard" | "premium" | string;

type PlanFeatures = {
    dashboard: boolean;
    members: boolean;
    visitors: boolean;
    ministries: boolean;
    events: boolean;
    scales: boolean;
    finances: boolean;
    reports: boolean;
};

type UsePlanResult = {
    loading: boolean;
    planSlug: PlanSlug | null;
    planName: string | null;
    features: PlanFeatures | null;
    error: string | null;
    hasFeature: (feature: keyof PlanFeatures) => boolean;
};

export function usePlan(): UsePlanResult {
    const [loading, setLoading] = useState(true);
    const [planSlug, setPlanSlug] = useState<PlanSlug | null>(null);
    const [planName, setPlanName] = useState<string | null>(null);
    const [features, setFeatures] = useState<PlanFeatures | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadPlan() {
            setLoading(true);
            setError(null);

            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError) {
                if (!isMounted) return;
                setError("Erro ao carregar sessão");
                setLoading(false);
                return;
            }

            const session = sessionData.session;
            const slug =
                (session?.user?.app_metadata as any)?.plan_slug as PlanSlug | undefined;

            if (!slug) {
                if (!isMounted) return;
                setPlanSlug(null);
                setPlanName(null);
                setFeatures(null);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("plans")
                .select("plan_slug, name, features")
                .eq("plan_slug", slug)
                .single();

            if (!isMounted) return;

            if (error) {
                setError("Erro ao carregar plano");
                setLoading(false);
                return;
            }

            setPlanSlug(data.plan_slug as PlanSlug);
            setPlanName(data.name);
            setFeatures(data.features as PlanFeatures);
            setLoading(false);
        }

        loadPlan();

        return () => {
            isMounted = false;
        };
    }, []);

    function hasFeature(feature: keyof PlanFeatures): boolean {
        if (!features) return false;
        return Boolean(features[feature]);
    }

    return {
        loading,
        planSlug,
        planName,
        features,
        error,
        hasFeature,
    };
}
