import { supabase } from "@/lib/supabaseClient";
import type { CancelReason, RetentionOffer } from "@/lib/retention";

// Função do Supabase que aplica o desconto no Pagar.me (a mesma usada pelo app)
const FN = "retencao-assinatura";

export type OfferStatus = RetentionOffer & { eligible: boolean };

// Lê a mensagem de erro que a função devolveu ({ error: "..." })
async function errorMessage(error: unknown, fallback: string) {
    try {
        const context = (error as { context?: { json?: () => Promise<{ error?: unknown }> } } | null)?.context;
        const body = await context?.json?.();
        if (body?.error) return String(body.error);
    } catch {
        // resposta sem JSON
    }
    return fallback;
}

// A igreja pode receber o desconto agora? (1 vez a cada 12 meses)
// Em qualquer falha, segue sem oferta — nunca trava o cancelamento.
export async function getOfferStatus(): Promise<OfferStatus | null> {
    try {
        const { data, error } = await supabase.functions.invoke(FN, { body: { action: "status" } });
        if (error || !data) return null;
        return {
            eligible: !!data.eligible,
            percent: Number(data.percent) || 30,
            cycles: Number(data.cycles) || 1,
            billingCycle: data.billing_cycle === "yearly" ? "yearly" : "monthly",
        };
    } catch {
        return null;
    }
}

// Aplica o desconto na assinatura (no Pagar.me, pelo servidor)
export async function acceptDiscount(reason: CancelReason, details: string | null) {
    const { data, error } = await supabase.functions.invoke(FN, {
        body: { action: "accept", reason, details: details?.trim() || null },
    });
    if (error || !data?.success) {
        throw new Error(await errorMessage(error, "Não foi possível aplicar o desconto agora. Tente novamente."));
    }
    return data as { success: true; percent: number; cycles: number; billing_cycle: string };
}

// Guarda o motivo (só para melhorarmos o sistema). Falha aqui não atrapalha o usuário.
export async function saveFeedback(input: {
    reason: CancelReason;
    details: string | null;
    outcome: "canceled" | "kept";
    planSlug: string;
    billingCycle: string;
}) {
    try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        const churchId = user?.app_metadata?.church_id as string | undefined;
        if (!user || !churchId) return;
        await supabase.from("subscription_cancel_feedback").insert({
            church_id: churchId,
            user_id: user.id,
            reason: input.reason,
            details: input.details?.trim().slice(0, 500) || null,
            outcome: input.outcome,
            plan_slug: input.planSlug,
            billing_cycle: input.billingCycle,
        });
    } catch {
        // ignora
    }
}

// Cancela a renovação automática (o plano continua até o fim do período pago)
export async function cancelRenewal() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Sessão expirada. Faça login novamente.");

    const res = await fetch("/api/pagarme/cancel-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.success) throw new Error(json?.error || "Não foi possível cancelar agora.");
}
