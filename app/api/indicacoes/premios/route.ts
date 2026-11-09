export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rotina diária (Vercel Cron, ver vercel.json): aplica o prêmio das indicações cujo prazo
// de 7 dias depois do primeiro pagamento da indicada já passou.
// Variáveis na Vercel: CRON_SECRET (a Vercel manda em "Authorization: Bearer ..."),
// SUPABASE_SERVICE_ROLE_KEY, PAGARME_SECRET_KEY e REVENUECAT_SECRET_API_KEY (para quem assina pela loja).
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chooseReward, referredStillPaying, type ChurchRow } from "@/lib/referralRewards";

const COLUMNS =
    "id, user_id, plan_slug, subscription_active, billing_provider, billing_cycle, pagarme_subscription_id, canceled_at, plan_expires_at, store_product_id";

function admin() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

type Db = ReturnType<typeof admin>;

async function church(db: Db, id: string): Promise<ChurchRow | null> {
    const { data } = await db.from("church_profiles").select(COLUMNS).eq("id", id).maybeSingle();
    return (data as ChurchRow | null) ?? null;
}

// Atualiza o "crachá" (token) de todos da igreja, como os outros avisos de pagamento fazem
async function refreshClaims(db: Db, churchId: string, ownerId: string | null) {
    const { data } = await db.from("church_users").select("user_id").eq("church_id", churchId);
    const ids = new Set<string>((data ?? []).map((r: { user_id: string }) => r.user_id));
    if (ownerId) ids.add(ownerId);
    for (const id of ids) await db.rpc("refresh_church_claim", { p_user_id: id });
}

async function pagarmeDiscount(subscriptionId: string, discount: unknown) {
    const secret = process.env.PAGARME_SECRET_KEY;
    if (!secret) return "PAGARME_SECRET_KEY não configurada.";
    const res = await fetch(`https://api.pagar.me/core/v5/subscriptions/${subscriptionId}/discounts`, {
        method: "POST",
        headers: { Authorization: "Basic " + Buffer.from(secret + ":").toString("base64"), "Content-Type": "application/json" },
        body: JSON.stringify(discount),
    });
    const body = await res.json().catch(() => null);
    return res.ok && body?.id ? null : `Pagar.me recusou o desconto (${res.status}).`;
}

async function storeDefer(appUserId: string, productId: string) {
    const key = process.env.REVENUECAT_SECRET_API_KEY;
    if (!key) return "REVENUECAT_SECRET_API_KEY não configurada na Vercel.";
    const res = await fetch(
        `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}/subscriptions/${encodeURIComponent(productId)}/defer`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ extend_by_days: 30 }),
        }
    );
    return res.ok ? null : `A loja recusou o adiamento (${res.status}).`;
}

type Due = { id: string; referrer_church_id: string; referred_church_id: string };

async function processOne(db: Db, ref: Due) {
    const finish = (values: Record<string, unknown>) => db.from("referrals").update(values).eq("id", ref.id);

    const referred = await church(db, ref.referred_church_id);
    if (!referred || !referredStillPaying(referred)) {
        await finish({ status: "cancelada", reward_note: "A igreja indicada cancelou ou não está mais pagando." });
        return "cancelada";
    }

    const referrer = await church(db, ref.referrer_church_id);
    if (!referrer) {
        await finish({ status: "cancelada", reward_note: "A igreja que indicou não existe mais." });
        return "cancelada";
    }

    const reward = chooseReward(referrer);
    let error: string | null = null;

    if (reward.kind === "manual") error = reward.note;
    else if (reward.kind === "pagarme_desconto") error = await pagarmeDiscount(reward.subscriptionId, reward.discount);
    else if (reward.kind === "loja_adiamento") error = await storeDefer(referrer.id, reward.productId);
    else {
        const { error: dbError } = await db.from("church_profiles").update(reward.update).eq("id", referrer.id);
        if (dbError) error = "Não foi possível atualizar o plano.";
        else await refreshClaims(db, referrer.id, referrer.user_id);
    }

    if (error) {
        await finish({ status: "pendente_manual", reward_note: error });
        console.error("Indicação: prêmio pendente", ref.id, error);
        return "pendente_manual";
    }

    await finish({
        status: "premiada",
        rewarded_at: new Date().toISOString(),
        reward_kind: reward.kind,
        reward_note: reward.note,
    });
    return "premiada";
}

export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const db = admin();
    const { data, error } = await db.rpc("referral_claim_due", { p_limit: 50 });
    if (error) {
        console.error("Indicação: falha ao buscar prêmios", error);
        return NextResponse.json({ error: "Falha ao buscar indicações." }, { status: 500 });
    }

    const results: Record<string, number> = {};
    for (const ref of (data ?? []) as Due[]) {
        let r: string;
        try {
            r = await processOne(db, ref);
        } catch (err) {
            console.error("Indicação: erro", ref.id, err);
            await db.from("referrals").update({ status: "pendente_manual", reward_note: "Erro inesperado ao aplicar o prêmio." }).eq("id", ref.id);
            r = "pendente_manual";
        }
        results[r] = (results[r] ?? 0) + 1;
    }

    return NextResponse.json({ ok: true, processed: (data ?? []).length, results });
}
