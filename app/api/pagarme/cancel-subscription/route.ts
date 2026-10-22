export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

function fail(error: string, status: number) {
    return NextResponse.json({ error }, { status });
}

function isSafeId(id: unknown): id is string {
    return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

// Cancela a assinatura no Pagar.me. Já cancelada ou inexistente também conta como ok.
async function cancelOnPagarme(subscriptionId: string) {
    const auth = "Basic " + Buffer.from(process.env.PAGARME_SECRET_KEY! + ":").toString("base64");
    const url = `https://api.pagar.me/core/v5/subscriptions/${subscriptionId}`;
    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: { Authorization: auth, "Content-Type": "application/json" },
            body: JSON.stringify({ cancel_pending_invoices: true }),
        });
        if (res.ok || res.status === 404) return true;

        const check = await fetch(url, { headers: { Authorization: auth }, cache: "no-store" });
        if (check.status === 404) return true;
        const sub = check.ok ? await check.json() : null;
        return sub?.status === "canceled";
    } catch {
        return false;
    }
}

// Cancela a RENOVAÇÃO automática. A igreja continua com o plano até o fim do
// período já pago (plan_expires_at); depois a rotina diária a passa para o Grátis.
export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return fail("Faça login para cancelar a assinatura.", 401);

        const { data: auth } = await supabase.auth.getUser(token);
        const user = auth?.user;
        if (!user) return fail("Sessão expirada. Faça login novamente.", 401);

        const { data: link } = await supabase
            .from("church_users")
            .select("church_id, role, status")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!link || link.role !== "pastor" || link.status !== "active") {
            return fail("Somente o Pastor da igreja pode cancelar a assinatura.", 403);
        }

        const { data: church } = await supabase
            .from("church_profiles")
            .select("id, plan_slug, pagarme_subscription_id, plan_expires_at, canceled_at")
            .eq("id", link.church_id)
            .single();

        if (!church) return fail("Igreja não encontrada.", 404);

        if (!church.pagarme_subscription_id || church.plan_slug === "free") {
            return fail("Esta igreja não tem uma assinatura com renovação automática.", 400);
        }

        // Já cancelada antes: responde de novo com a data final, sem chamar o Pagar.me
        if (church.canceled_at) {
            return NextResponse.json({ success: true, access_until: church.plan_expires_at });
        }

        if (!isSafeId(church.pagarme_subscription_id) || !(await cancelOnPagarme(church.pagarme_subscription_id))) {
            return fail("Não foi possível cancelar no Pagar.me agora. Tente novamente em alguns minutos.", 502);
        }

        await supabase
            .from("church_profiles")
            .update({ canceled_at: new Date().toISOString() })
            .eq("id", church.id);

        console.log("🛑 Renovação cancelada:", church.id, "acesso até", church.plan_expires_at);
        return NextResponse.json({ success: true, access_until: church.plan_expires_at });
    } catch (err) {
        console.error("❌ Erro ao cancelar assinatura:", err);
        return fail("Erro interno", 500);
    }
}
