export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

// O que acontece ao excluir (vem do banco: account_deletion_info)
//   user_only     -> usuário convidado: apaga só a conta dele
//   transfer      -> titular com outro Pastor ativo: a igreja passa para ele
//   delete_church -> titular sozinho: apaga a igreja, os dados e os logins da igreja
//   blocked       -> administrador da plataforma
type Mode = "user_only" | "transfer" | "delete_church" | "blocked";
type DeletionInfo = {
    mode: Mode;
    church_name?: string | null;
    successor_name?: string | null;
    other_users?: number | null;
    subscription_id?: string | null;
};

function fail(error: string, status: number, extra: Record<string, unknown> = {}) {
    return NextResponse.json({ error, ...extra }, { status });
}

function isSafeId(id: unknown): id is string {
    return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

// O que a página pode mostrar (nunca o id da assinatura)
function preview(info: DeletionInfo) {
    return {
        mode: info.mode,
        church_name: info.church_name ?? null,
        successor_name: info.successor_name ?? null,
        other_users: info.other_users ?? 0,
        has_subscription: !!info.subscription_id,
    };
}

// Cancela a assinatura no Pagar.me. Já cancelada ou inexistente também conta como ok.
async function cancelSubscription(subscriptionId: string) {
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

// Corpo: { email, password }             -> só confere e devolve o que vai acontecer ("preview")
//        { email, password, confirm, mode } -> exclui de verdade
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const email = String(body?.email ?? "").trim();
        const password = String(body?.password ?? "");
        const confirm = body?.confirm === true;

        if (!email || !password) {
            return fail("E-mail e senha são obrigatórios", 400);
        }

        // 1) Confirma que é o dono da conta
        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } }
        );
        const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({ email, password });
        if (signInError || !signInData?.user) {
            return fail("E-mail ou senha incorretos", 401);
        }
        const userId = signInData.user.id;

        // 2) O que vai acontecer
        const { data: info, error: infoError } = await supabase.rpc("account_deletion_info", { p_user_id: userId });
        if (infoError || !info?.mode) {
            console.error("❌ Erro ao conferir a exclusão:", infoError);
            return fail("Não foi possível conferir a sua conta. Tente novamente.", 500);
        }
        const plan = info as DeletionInfo;

        if (plan.mode === "blocked") {
            return fail("Esta conta não pode ser excluída por aqui. Fale com o suporte.", 403);
        }

        if (!confirm) {
            return NextResponse.json({ preview: preview(plan) });
        }

        // A situação mudou desde que a pessoa conferiu (ex.: o outro Pastor foi removido)
        if (body?.mode !== plan.mode) {
            return fail("A situação da sua igreja mudou. Confira de novo antes de excluir.", 409, { preview: preview(plan) });
        }

        // 3) Igreja será apagada: cancela a assinatura ANTES. Se não der, não apaga nada.
        let canceled = false;
        if (plan.mode === "delete_church" && plan.subscription_id) {
            if (!isSafeId(plan.subscription_id) || !(await cancelSubscription(plan.subscription_id))) {
                return fail(
                    "Não foi possível cancelar a assinatura no Pagar.me, então nada foi apagado. Tente novamente em alguns minutos.",
                    502
                );
            }
            canceled = true;
        }

        // 4) Exclui (tudo numa única transação no banco)
        const { error: deleteError } = await supabase.rpc("delete_account", {
            p_user_id: userId,
            p_expected_mode: plan.mode,
        });

        if (deleteError) {
            console.error("❌ Erro ao excluir conta:", deleteError);
            if (/situação da igreja mudou/i.test(deleteError.message ?? "")) {
                return fail("A situação da sua igreja mudou. Confira de novo antes de excluir.", 409);
            }
            return fail(
                canceled
                    ? "A assinatura foi cancelada, mas houve um erro ao apagar os dados. Fale com o suporte."
                    : "Não foi possível excluir a conta, nada foi apagado. Tente novamente.",
                500
            );
        }

        return NextResponse.json({ success: true, mode: plan.mode });
    } catch (err) {
        console.error("❌ ERRO GERAL:", err);
        return fail("Erro interno", 500);
    }
}
