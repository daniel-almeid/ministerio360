"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export type PlanSlug = "free" | "standard" | "premium";

export type PlanDef = {
    slug: PlanSlug;
    name: string;
    price: number;
    features: string[];
};

export const PLANS: PlanDef[] = [
    {
        slug: "free",
        name: "GRÁTIS",
        price: 0,
        features: [
            "Dashboard",
            "Cadastro de membros",
            "Cadastro financeiro",
            "Relatórios simples",
        ],
    },
    {
        slug: "standard",
        name: "PADRÃO",
        price: 49.9,
        features: [
            "Dashboard",
            "Cadastro de membros",
            "Cadastro de visitantes",
            "Acompanhamento de visitantes",
            "Cadastro financeiro",
            "Relatórios simples",
        ],
    },
    {
        slug: "premium",
        name: "PREMIUM+",
        price: 89.9,
        features: [
            "Dashboard",
            "Cadastro de membros",
            "Cadastro de visitantes",
            "Acompanhamento de visitantes",
            "Cadastro financeiro",
            "Cadastro de ministérios",
            "Cadastro de eventos",
            "Cadastro de escalas",
            "Relatórios",
            "Suporte prioritário",
        ],
    },
];

export function useSubscription() {
    const [loading, setLoading] = useState(true);
    const [planSlug, setPlanSlug] = useState<PlanSlug>("free");
    const [isActive, setIsActive] = useState(false);

    const currentPlan = PLANS.find((p) => p.slug === planSlug)!;
    const price = currentPlan.price;

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const { data: userData } = await supabase.auth.getUser();
        const churchId = userData.user?.app_metadata?.church_id as string | undefined;

        if (!churchId) {
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from("church_profiles")
            .select("plan_slug, subscription_active")
            .eq("id", churchId)
            .single();

        if (data) {
            setPlanSlug((data.plan_slug as PlanSlug) ?? "free");
            setIsActive(!!data.subscription_active);
        }

        setLoading(false);
    }

    async function cancelSubscription() {
        const { data: userData } = await supabase.auth.getUser();
        const churchId = userData.user?.app_metadata?.church_id as string | undefined;

        if (!churchId) return;

        await supabase
            .from("church_profiles")
            .update({
                plan_slug: "free",
                subscription_active: false,
            })
            .eq("id", churchId);

        setPlanSlug("free");
        setIsActive(false);
    }

    return {
        loading,
        planSlug,
        currentPlan,
        price,
        isActive,
        formattedNextPayment: null,
        formattedLastPayment: null,
        progressPercent: 0,
        paymentHistory: [],
        hasPaidPlan: planSlug !== "free",
        cancelSubscription,
    };
}
