"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";

export type PlanSlug = "free" | "standard" | "premium";

export type PlanDef = {
    slug: PlanSlug;
    name: string;
    price: number;
    features: string[];
};

export type PaymentItem = {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    description?: string;
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
    plan_slug: PlanSlug | null;
    subscription_active: boolean | null;
    current_period_end: string | null;
    canceled_at: string | null;
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function useSubscription() {
    const [loading, setLoading] = useState(true);
    const [planSlug, setPlanSlug] = useState<PlanSlug>("free");
    const [subscriptionActive, setSubscriptionActive] = useState(false);
    const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
    const [canceledAt, setCanceledAt] = useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [paymentHistory, setPaymentHistory] = useState<PaymentItem[]>([]);

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
            .select("plan_slug, subscription_active, current_period_end, canceled_at")
            .eq("id", churchId)
            .single<ProfileRow>();

        if (data) {
            setPlanSlug((data.plan_slug as PlanSlug) || "free");
            setSubscriptionActive(!!data.subscription_active);
            setCurrentPeriodEnd(data.current_period_end);
            setCanceledAt(data.canceled_at);
        }

        const { data: payments } = await supabase
            .from("subscription_payments")
            .select("*")
            .eq("church_id", churchId)
            .order("created_at", { ascending: false });

        setPaymentHistory((payments ?? []) as PaymentItem[]);

        setLoading(false);
    }

    async function cancelSubscription() {
        setCancelLoading(true);

        const { data: userData } = await supabase.auth.getUser();
        const churchId = userData.user?.app_metadata?.church_id as string | undefined;

        if (!churchId) {
            setCancelLoading(false);
            return;
        }

        let periodEnd = currentPeriodEnd;
        if (!periodEnd) {
            const base = new Date();
            base.setDate(base.getDate() + 30);
            periodEnd = base.toISOString().slice(0, 10);
        }

        const { error } = await supabase.rpc("cancel_subscription", {
            p_church_id: churchId,
            p_current_period_end: periodEnd,
        });

        if (!error) {
            setSubscriptionActive(false);
            setCurrentPeriodEnd(periodEnd);
            setCanceledAt(new Date().toISOString());
        }

        setCancelLoading(false);
    }

    const hasPaidPlan = planSlug !== "free";

    const today = new Date();
    const expiresDate = currentPeriodEnd
        ? (() => {
            const [y, m, d] = currentPeriodEnd.split("-");
            return new Date(Number(y), Number(m) - 1, Number(d));
        })()
        : null;

    const isCancelledButActive =
        !subscriptionActive &&
        hasPaidPlan &&
        !!expiresDate &&
        expiresDate.getTime() >= today.setHours(0, 0, 0, 0);

    const isActive = hasPaidPlan && subscriptionActive;

    const isExpired =
        !subscriptionActive &&
        hasPaidPlan &&
        !!expiresDate &&
        expiresDate.getTime() < today.setHours(0, 0, 0, 0);

    const currentPlan = useMemo(
        () => PLANS.find((p) => p.slug === planSlug) || PLANS[0],
        [planSlug]
    );

    const price = currentPlan.price;

    const formattedNextPayment =
        isActive && currentPeriodEnd ? formatDate(currentPeriodEnd) : null;

    const formattedExpiresOn =
        isCancelledButActive && currentPeriodEnd ? formatDate(currentPeriodEnd) : null;

    const formattedLastPayment = null;

    let progressPercent = 0;
    if ((isActive || isCancelledButActive) && expiresDate) {
        const end = new Date(expiresDate);
        const start = new Date(end);
        start.setDate(start.getDate() - 30);
        const totalMs = end.getTime() - start.getTime();
        const usedMs = today.getTime() - start.getTime();
        const raw = (usedMs / totalMs) * 100;
        progressPercent = Math.min(100, Math.max(0, Math.round(raw)));
    }

    return {
        loading,
        planSlug,
        currentPlan,
        price,
        isActive,
        isCancelledButActive,
        isExpired,
        formattedNextPayment,
        formattedExpiresOn,
        formattedLastPayment,
        progressPercent,
        paymentHistory,
        hasPaidPlan,
        cancelSubscription,
        cancelLoading,
    };
}
