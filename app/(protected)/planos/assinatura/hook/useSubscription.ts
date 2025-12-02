"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../../lib/supabaseClient";

export type PlanSlug = "free" | "standard" | "premium";

export type PlanDef = {
    slug: PlanSlug;
    name: string;
    price: number; // mensal
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
            "Relatórios completos",
            "Suporte prioritário",
        ],
    },
];

// TIPAGEM DO church_profiles
type ProfileRow = {
    plan_slug: PlanSlug;
    subscription_active: boolean;

    plan_expires_at: string | null;
    current_period_end: string | null;
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
            .select("plan_slug, subscription_active, plan_expires_at, current_period_end")
            .eq("id", churchId)
            .single<ProfileRow>();

        setProfile(data ?? null);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const planSlug = profile?.plan_slug ?? "free";
    const currentPlan = PLANS.find((p) => p.slug === planSlug)!;

    // DATAS TRATADAS
    const expiresOn = profile?.plan_expires_at
        ? new Date(profile.plan_expires_at)
        : null;

    const formattedExpiresOn = expiresOn
        ? expiresOn.toLocaleDateString("pt-BR")
        : null;

    // CÁLCULO DO PERÍODO
    const now = new Date();

    let progressPercent = 0;
    let formattedNextPayment = "";
    let formattedLastPayment = "";
    let hasPaidPlan = planSlug !== "free";

    if (expiresOn) {
        const start = new Date(expiresOn);
        start.setDate(start.getDate() - 30);

        const total = expiresOn.getTime() - start.getTime();
        const used = now.getTime() - start.getTime();

        progressPercent = Math.round(
            Math.min(100, Math.max(0, (used / total) * 100))
        );

        formattedNextPayment = expiresOn.toLocaleDateString("pt-BR");
        formattedLastPayment = start.toLocaleDateString("pt-BR");
    }


    return {
        loading,
        planSlug,
        currentPlan,
        price: currentPlan.price,
        isActive: profile?.subscription_active ?? false,
        expiresOn,
        formattedExpiresOn,
        formattedLastPayment,
        formattedNextPayment,
        progressPercent,
        hasPaidPlan,

        reload: load,
    };
}
