"use client";

import { supabase } from "@/lib/supabaseClient";
import type { BillingCycle, PlanSlug } from "@/lib/plans";
import type { CardFormValues } from "./components/paymentCardModal";

const PAGARME_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY!;

async function tokenizeCard(values: CardFormValues) {
    const res = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${PAGARME_PUBLIC_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "card",
            card: {
                number: values.number.replace(/\s/g, ""),
                holder_name: values.holderName,
                exp_month: values.expMonth,
                exp_year: values.expYear,
                cvv: values.cvv,
            },
        }),
    });

    const json = await res.json();
    if (!res.ok || !json?.id) {
        throw new Error(json?.message || "Cartão inválido. Verifique os dados e tente novamente.");
    }
    return json.id as string;
}

// Assina um plano com cartão (usado em Planos, Minha assinatura e no cadastro).
// Logado: o servidor identifica a igreja pelo login.
// No cadastro (ainda sem login): identifica pelo e-mail recém-cadastrado.
export async function subscribeWithCard(input: {
    planSlug: PlanSlug;
    cycle: BillingCycle;
    values: CardFormValues;
    email?: string;
    name?: string;
}) {
    // No cadastro o e-mail vem junto e o login ainda não existe
    const { data } = await supabase.auth.getSession();
    const session = input.email ? null : data.session;
    const user = session?.user;

    const email = user?.email ?? input.email;
    if (!email) throw new Error("Sessão expirada. Faça login novamente.");

    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || input.name || "Usuário";
    const cardToken = await tokenizeCard(input.values);
    const v = input.values;
    const streetLine = `${v.street}, ${v.number_address}${v.complement ? " - " + v.complement : ""}`;

    const res = await fetch("/api/pagarme/create-subscription", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
            plan_slug: input.planSlug,
            billing_cycle: input.cycle,
            installments: input.cycle === "yearly" ? Number(v.installments || 1) : 1,
            card_token: cardToken,
            email,
            name,
            document: v.document,
            phone: { area_code: v.areaCode, number: v.phoneNumber },
            address: { line_1: streetLine, zip_code: v.zipCode, city: v.city, state: v.state },
        }),
    });

    const json = await res.json();
    if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Erro ao criar assinatura.");
    }

    // Token novo já com o plano atualizado (sem precisar sair e entrar)
    if (session) await supabase.auth.refreshSession();
    return json;
}
