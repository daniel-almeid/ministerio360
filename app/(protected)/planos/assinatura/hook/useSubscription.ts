"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../../lib/supabaseClient";

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
        features: ["Dashboard", "Cadastro de membros", "Cadastro financeiro", "Relatórios simples"],
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

type ProfileRow = {
    plan_slug: PlanSlug;
    subscription_active: boolean;
    pagarme_subscription_id: string | null;
};

export function useSubscription() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileRow | null>(null);

    async function load() {
        const { data: user } = await supabase.auth.getUser();
        const churchId = user.user?.app_metadata?.church_id;

        if (!churchId) {
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from("church_profiles")
            .select("plan_slug, subscription_active, pagarme_subscription_id")
            .eq("id", churchId)
            .single<ProfileRow>();

        setProfile(data ?? null);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const currentPlan = useMemo(() => {
        return PLANS.find((p) => p.slug === (profile?.plan_slug ?? "free"))!;
    }, [profile]);

    return {
        loading,
        planSlug: profile?.plan_slug ?? "free",
        subscriptionActive: profile?.subscription_active ?? false,
        currentPlan,
        price: currentPlan.price,
        pagarmeSubscriptionId: profile?.pagarme_subscription_id,
        reload: load,
    };
}