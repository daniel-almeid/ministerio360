export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

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

async function renewBySubscriptionId(subscriptionId: string) {
    const { data: profile } = await supabase
        .from("church_profiles")
        .select("id, user_id")
        .eq("pagarme_subscription_id", subscriptionId)
        .single();

    if (!profile) {
        console.log("⚠️ Nenhum church_profile com essa pagarme_subscription_id:", subscriptionId);
        return false;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase
        .from("church_profiles")
        .update({ subscription_active: true, plan_expires_at: expiresAt.toISOString() })
        .eq("id", profile.id);

    if (profile.user_id) {
        await supabase.rpc("refresh_church_claim", { p_user_id: profile.user_id });
    }
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

    if (profile.user_id) {
        await supabase.rpc("refresh_church_claim", { p_user_id: profile.user_id });
    }
    return true;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📥 WEBHOOK RECEBIDO:", JSON.stringify(body, null, 2));

        const event = body.type;
        const data = body.data;

        if (!event) {
            return NextResponse.json({ ok: true });
        }

        switch (event) {
            case "order.paid": {
                // Fluxo antigo (pedido avulso via Checkout, se algum dia for reativado)
                const email = data?.customer?.email;
                const planSlug = data?.items?.[0]?.code;
                if (email && planSlug) await activatePlanByEmail(email, planSlug);
                break;
            }

            case "invoice.paid": {
                // Cobrança recorrente do mês foi paga com sucesso
                const subscriptionId =
                    data?.subscription?.id ?? data?.subscription_id ?? data?.subscription;
                if (subscriptionId) {
                    await renewBySubscriptionId(subscriptionId);
                } else {
                    console.log("⚠️ invoice.paid sem subscription_id identificável:", data);
                }
                break;
            }

            case "invoice.payment_failed": {
                // Cobrança do mês falhou (cartão recusado, sem limite, etc.)
                const subscriptionId =
                    data?.subscription?.id ?? data?.subscription_id ?? data?.subscription;
                if (subscriptionId) {
                    await deactivateBySubscriptionId(subscriptionId, "cobrança falhou");
                }
                break;
            }

            case "subscription.canceled": {
                const subscriptionId = data?.id ?? data?.subscription_id;
                if (subscriptionId) {
                    await deactivateBySubscriptionId(subscriptionId, "assinatura cancelada");
                }
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