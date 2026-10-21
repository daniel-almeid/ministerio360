export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

// Atualiza o "crachá" (token) de todos os usuários da igreja
async function refreshChurchClaims(churchId: string, ownerId: string | null) {
    const { data } = await supabase.from("church_users").select("user_id").eq("church_id", churchId);
    const ids = new Set<string>((data ?? []).map((r: { user_id: string }) => r.user_id));
    if (ownerId) ids.add(ownerId);
    for (const id of ids) {
        await supabase.rpc("refresh_church_claim", { p_user_id: id });
    }
}

async function activatePlanByEmail(email: string, planSlug: string) {
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr || !usersData) return false;

    const userAdmin = usersData.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!userAdmin) return false;

    const { data: profile } = await supabase
        .from("church_profiles")
        .select("id")
        .eq("user_id", userAdmin.id)
        .single();
    if (!profile) return false;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase
        .from("church_profiles")
        .update({ plan_slug: planSlug, subscription_active: true, plan_expires_at: expiresAt.toISOString() })
        .eq("id", profile.id);

    await supabase.rpc("refresh_church_claim", { p_user_id: userAdmin.id });
    return true;
}

type PaidPlan = { plan_slug: string; billing_cycle: "monthly" | "yearly" };
const PAID_PLANS = ["standard", "premium_basic", "premium"];

// Qual plano a assinatura do Pagar.me cobra de verdade.
// 1º pelo id do plano no Pagar.me (tabela "plans"); 2º pelo metadata gravado ao assinar.
async function planOfSubscription(subscription: any): Promise<PaidPlan | null> {
    const pagarmePlanId = subscription?.plan?.id;
    if (isSafeId(pagarmePlanId)) {
        const { data } = await supabase.from("plans").select("plan_slug, pagarme_plan_id, pagarme_yearly_plan_id");
        for (const p of (data ?? []) as any[]) {
            if (p.pagarme_plan_id === pagarmePlanId) return { plan_slug: p.plan_slug, billing_cycle: "monthly" };
            if (p.pagarme_yearly_plan_id === pagarmePlanId) return { plan_slug: p.plan_slug, billing_cycle: "yearly" };
        }
    }

    const slug = subscription?.metadata?.plan_slug;
    const cycle = subscription?.metadata?.billing_cycle;
    if (PAID_PLANS.includes(slug) && (cycle === "monthly" || cycle === "yearly")) {
        return { plan_slug: slug, billing_cycle: cycle };
    }
    return null;
}

// Renovação: a validade vai até o fim do ciclo pago (mensal ou anual).
// Também devolve o plano pago: se a rotina diária já tinha passado a igreja
// para o Grátis (pagamento atrasado), o pagamento confirmado restaura tudo.
async function renewBySubscriptionId(subscriptionId: string, cycleEnd?: string | null, plan?: PaidPlan | null) {
    const { data: profile } = await supabase
        .from("church_profiles")
        .select("id, user_id, billing_cycle")
        .eq("pagarme_subscription_id", subscriptionId)
        .single();

    if (!profile) {
        console.log("⚠️ Nenhum church_profile com essa pagarme_subscription_id:", subscriptionId);
        return false;
    }

    const cycle = plan?.billing_cycle ?? profile.billing_cycle;
    let expiresAt = cycleEnd ? new Date(cycleEnd) : null;
    if (!expiresAt || isNaN(expiresAt.getTime())) {
        // Sem a data do Pagar.me: 30 dias no mensal, 1 ano no anual
        expiresAt = new Date();
        if (cycle === "yearly") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        else expiresAt.setDate(expiresAt.getDate() + 30);
    }

    await supabase
        .from("church_profiles")
        .update({
            subscription_active: true,
            plan_expires_at: expiresAt.toISOString(),
            ...(plan ? { plan_slug: plan.plan_slug, billing_cycle: plan.billing_cycle } : {}),
        })
        .eq("id", profile.id);

    await refreshChurchClaims(profile.id, profile.user_id);
    return true;
}

async function deactivateBySubscriptionId(subscriptionId: string, reason: string) {
    const { data: profile } = await supabase
        .from("church_profiles")
        .select("id, user_id")
        .eq("pagarme_subscription_id", subscriptionId)
        .single();

    if (!profile) return false;

    await supabase
        .from("church_profiles")
        .update({ subscription_active: false })
        .eq("id", profile.id);

    console.log(`⚠️ Assinatura ${subscriptionId} marcada como inativa (${reason}).`);

    await refreshChurchClaims(profile.id, profile.user_id);
    return true;
}

// ---------------------------------------------------------------------
// SEGURANÇA: o corpo do webhook pode ser forjado por qualquer pessoa que
// descubra a URL. Por isso nunca confiamos nele: buscamos o objeto
// direto na API do Pagar.me (com a nossa chave secreta) e só agimos
// com base no que a própria API responder.
// ---------------------------------------------------------------------
async function fetchFromPagarme(path: string) {
    const secret = process.env.PAGARME_SECRET_KEY!;
    const auth = "Basic " + Buffer.from(secret + ":").toString("base64");
    const res = await fetch(`https://api.pagar.me/core/v5/${path}`, {
        headers: { Authorization: auth },
        cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
}

function isSafeId(id: unknown): id is string {
    return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📥 WEBHOOK RECEBIDO:", body?.type, body?.data?.id);

        const event = body.type;
        const data = body.data;

        if (!event) {
            return NextResponse.json({ ok: true });
        }

        switch (event) {
            case "order.paid": {
                // Fluxo antigo (pedido avulso via Checkout, se algum dia for reativado)
                if (!isSafeId(data?.id)) break;
                const order = await fetchFromPagarme(`orders/${data.id}`);
                if (order?.status !== "paid") {
                    console.log("⚠️ order.paid não confirmado na API do Pagar.me:", data.id);
                    break;
                }
                const email = order?.customer?.email;
                const planSlug = order?.items?.[0]?.code;
                if (email && planSlug) await activatePlanByEmail(email, planSlug);
                break;
            }

            case "invoice.paid":
            case "invoice.payment_failed": {
                // Cobrança recorrente do mês (paga ou recusada)
                if (!isSafeId(data?.id)) break;
                const invoice = await fetchFromPagarme(`invoices/${data.id}`);
                const expected = event === "invoice.paid" ? "paid" : "failed";
                if (invoice?.status !== expected) {
                    console.log(`⚠️ ${event} não confirmado na API do Pagar.me:`, data.id);
                    break;
                }
                const subscriptionId =
                    invoice?.subscription?.id ?? invoice?.subscription_id ?? invoice?.subscription;
                if (!isSafeId(subscriptionId)) {
                    console.log(`⚠️ ${event} sem subscription_id identificável:`, data.id);
                    break;
                }
                if (event === "invoice.paid") {
                    // Fim do ciclo: pela fatura ou, se faltar, pela assinatura
                    const subscription = await fetchFromPagarme(`subscriptions/${subscriptionId}`);
                    const cycleEnd: string | null =
                        invoice?.cycle?.end_at ?? subscription?.current_cycle?.end_at ?? null;
                    const plan = await planOfSubscription(subscription);
                    await renewBySubscriptionId(subscriptionId, cycleEnd, plan);
                } else {
                    // Não bloqueia na hora: o Pagar.me tenta cobrar de novo. Se nada for pago,
                    // a rotina diária passa a igreja para o Grátis 1 dia depois do vencimento.
                    console.log(`⚠️ Cobrança recusada (assinatura ${subscriptionId}); aguardando nova tentativa.`);
                }
                break;
            }

            case "subscription.canceled": {
                const subscriptionId = data?.id ?? data?.subscription_id;
                if (!isSafeId(subscriptionId)) break;
                const subscription = await fetchFromPagarme(`subscriptions/${subscriptionId}`);
                if (subscription?.status !== "canceled") {
                    console.log("⚠️ subscription.canceled não confirmado na API do Pagar.me:", subscriptionId);
                    break;
                }
                await deactivateBySubscriptionId(subscriptionId, "assinatura cancelada");
                break;
            }

            default:
                console.log(`⚠️ Evento ignorado: ${event}`);
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("❌ ERRO GERAL NO WEBHOOK:", err);
        return NextResponse.json({ error: "Erro webhook" }, { status: 500 });
    }
}
