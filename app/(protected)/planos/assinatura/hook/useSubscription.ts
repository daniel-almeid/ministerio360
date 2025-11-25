"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

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
        features: [
            "Cadastro de membros",
            "Cadastro financeiro",
            "Relatórios simples",
        ],
    },
    {
        slug: "basic",
        name: "Padrão",
        price: 49.90,
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
        price: 89.90,
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
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;

        if (!user) {
            setLoading(false);
            return;
        }

        const userPlan = (user.app_metadata?.plan_slug as PlanSlug) || "free";
        const email = user.email ?? null;

        setPlanSlug(userPlan);

        if (!email || userPlan === "free") {
            setLoading(false);
            return;
        }

        const res = await fetch(`/api/subscription-info?email=${email}`);
        const info = await res.json();

        if (info.status) setStatus(info.status);

        if (info.next_payment_date) {
            const next = new Date(info.next_payment_date);
            setNextPayment(next);

            const last = new Date(next);
            last.setMonth(last.getMonth() - 1);
            setLastPayment(last);
        }

        setLoading(false);
    }

    async function cancelSubscription() {
        if (!confirm("Tem certeza que deseja cancelar sua assinatura?")) return;

        const res = await fetch("/api/cancel", { method: "POST" });
        const data = await res.json();

        if (data.success) window.location.reload();
        else alert("Erro ao cancelar assinatura.");
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
        currentPlan,
        price,
        isActive,
        formattedLastPayment,
        formattedNextPayment,
        progressPercent,
        paymentHistory,
        hasPaidPlan,
        nextPayment,
        lastPayment,
        cancelSubscription,
    };
}
