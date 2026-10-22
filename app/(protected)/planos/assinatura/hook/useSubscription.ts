"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { PLANS, getPlan, priceCents, type BillingCycle, type PlanInfo, type PlanSlug } from "@/lib/plans";

export type { PlanSlug, BillingCycle };
export type PlanDef = PlanInfo;
export { PLANS };

// TIPAGEM DO church_profiles
type ProfileRow = {
    plan_slug: PlanSlug;
    subscription_active: boolean;
    billing_cycle: BillingCycle | null;
    plan_expires_at: string | null;
    current_period_end: string | null;
    canceled_at: string | null;
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
            .select("plan_slug, subscription_active, billing_cycle, plan_expires_at, current_period_end, canceled_at, pagarme_subscription_id")
            .eq("id", churchId)
            .single<ProfileRow>();

        setProfile(data ?? null);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const currentPlan = getPlan(profile?.plan_slug ?? "free");
    const planSlug = currentPlan.slug;
    const billingCycle: BillingCycle = profile?.billing_cycle === "yearly" ? "yearly" : "monthly";

    // DATAS TRATADAS
    const expiresOn = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null;
    const formattedExpiresOn = expiresOn ? expiresOn.toLocaleDateString("pt-BR") : null;

    // CÁLCULO DO PERÍODO (30 dias no mensal, 1 ano no anual)
    const now = new Date();

    let progressPercent = 0;
    let formattedNextPayment = "";
    let formattedLastPayment = "";
    const hasPaidPlan = planSlug !== "free";

    if (expiresOn) {
        const start = new Date(expiresOn);
        if (billingCycle === "yearly") start.setFullYear(start.getFullYear() - 1);
        else start.setDate(start.getDate() - 30);

        const total = expiresOn.getTime() - start.getTime();
        const used = now.getTime() - start.getTime();

        progressPercent = Math.round(Math.min(100, Math.max(0, (used / total) * 100)));

        formattedNextPayment = expiresOn.toLocaleDateString("pt-BR");
        formattedLastPayment = start.toLocaleDateString("pt-BR");
    }

    return {
        loading,
        planSlug,
        currentPlan,
        billingCycle,
        price: priceCents(currentPlan, billingCycle) / 100,
        isActive: profile?.subscription_active ?? false,
        expiresOn,
        formattedExpiresOn,
        formattedLastPayment,
        formattedNextPayment,
        progressPercent,
        hasPaidPlan,
        // Renovação automática: existe no Pagar.me e não foi cancelada
        hasAutoRenewal: !!profile?.pagarme_subscription_id,
        renewalCanceled: hasPaidPlan && !!profile?.canceled_at,

        reload: load,
    };
}
