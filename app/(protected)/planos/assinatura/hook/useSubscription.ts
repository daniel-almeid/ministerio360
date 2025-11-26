"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    notifySuccess,
    notifyError,
    notifyLoading,
    dismissToast,
} from "@/components/shared/toast";

export type PlanSlug = "free" | "basic" | "premium";

export type PlanDef = {
    slug: PlanSlug;
    name: string;
    price: number;
    features: string[];
};

export type PaymentItem = {
    date: string;
    amount: number;
};

export const PLANS: PlanDef[] = [
    {
        slug: "free",
        name: "Grátis",
        price: 0,
        features: ["Cadastro de membros", "Cadastro financeiro", "Relatórios simples"],
    },
    {
        slug: "basic",
        name: "Padrão",
        price: 49.9,
        features: [
            "Cadastro de membros",
            "Cadastro de visitantes",
            "Acompanhamento de visitantes",
            "Cadastro financeiro",
            "Relatórios simples",
        ],
    },
    {
        slug: "premium",
        name: "Premium+",
        price: 89.9,
        features: [
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
    const [status, setStatus] = useState<string | null>(null);
    const [nextPayment, setNextPayment] = useState<Date | null>(null);
    const [lastPayment, setLastPayment] = useState<Date | null>(null);

    useEffect(() => {
        loadSubscriptionData();
    }, []);

    async function loadSubscriptionData() {
        try {
            const { data } = await supabase.auth.getSession();
            const user = data.session?.user;

            if (!user) {
                setLoading(false);
                return;
            }

            const churchId = user.app_metadata?.church_id || null;

            if (!churchId) {
                setLoading(false);
                return;
            }

            const { data: church } = await supabase
                .from("church_profiles")
                .select("plan_slug")
                .eq("id", churchId)
                .single();

            const realPlan = (church?.plan_slug as PlanSlug) || "free";

            setPlanSlug(realPlan);

            const email = user.email ?? null;

            if (!email || realPlan === "free") {
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/subscription-info?email=${email}`);
            if (!res.ok) {
                setLoading(false);
                return;
            }

            const info = await res.json();

            if (info.status) setStatus(info.status);

            if (info.next_payment_date) {
                const next = new Date(info.next_payment_date);
                setNextPayment(next);

                const last = new Date(next);
                last.setMonth(last.getMonth() - 1);
                setLastPayment(last);
            }
        } finally {
            setLoading(false);
        }
    }

    async function cancelSubscription() {
        const loadingId = notifyLoading("Cancelando assinatura...");

        try {
            const res = await fetch("/api/cancel", { method: "POST" });
            const data = await res.json();

            if (data.success) {
                notifySuccess("Assinatura cancelada");
                dismissToast(loadingId);
                await loadSubscriptionData();
                return true;
            }

            notifyError("Não foi possível cancelar a assinatura");
            dismissToast(loadingId);
            return false;
        } catch {
            notifyError("Erro ao conectar ao servidor");
            dismissToast(loadingId);
            return false;
        }
    }

    const currentPlan = PLANS.find((p) => p.slug === planSlug) || PLANS[0];
    const price = currentPlan.price;

    const formattedLastPayment = lastPayment
        ? lastPayment.toLocaleDateString("pt-BR")
        : null;

    const formattedNextPayment = nextPayment
        ? nextPayment.toLocaleDateString("pt-BR")
        : null;

    const progressPercent = useMemo(() => {
        if (!lastPayment || !nextPayment) return null;

        const now = new Date();

        if (now <= lastPayment) return 0;
        if (now >= nextPayment) return 100;

        const total = nextPayment.getTime() - lastPayment.getTime();
        const elapsed = now.getTime() - lastPayment.getTime();
        return Math.round((elapsed / total) * 100);
    }, [lastPayment, nextPayment]);

    const paymentHistory: PaymentItem[] = useMemo(() => {
        if (!lastPayment || price === 0) return [];
        const items: PaymentItem[] = [];

        for (let i = 0; i < 3; i++) {
            const d = new Date(lastPayment);
            d.setMonth(d.getMonth() - i);
            items.push({
                date: d.toLocaleDateString("pt-BR"),
                amount: price,
            });
        }

        return items;
    }, [lastPayment, price]);

    const isActive =
        planSlug !== "free" &&
        (status === "authorized" ||
            status === "active" ||
            status === "approved" ||
            status === "charged" ||
            status === "paused");

    const hasPaidPlan = planSlug !== "free";

    return {
        loading,
        planSlug,
        status,
        currentPlan,
        price,
        isActive,
        hasPaidPlan,
        nextPayment,
        lastPayment,
        formattedLastPayment,
        formattedNextPayment,
        progressPercent,
        paymentHistory,
        cancelSubscription,
        reload: loadSubscriptionData,
    };
}
