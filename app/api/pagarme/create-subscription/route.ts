export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

const PAID_PLANS = ["standard", "premium_basic", "premium"];

type ChurchRow = {
    id: string;
    user_id: string | null;
    plan_slug: string | null;
    subscription_active: boolean | null;
    pagarme_subscription_id: string | null;
};

function fail(error: string, status: number, detail?: unknown) {
    return NextResponse.json({ error, ...(detail ? { detail } : {}) }, { status });
}

// Procura a conta pelo e-mail (usado só no cadastro, quando ainda não há login)
async function findUserIdByEmail(email: string) {
    const target = email.toLowerCase();
    for (let page = 1; page <= 50; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error || !data) return null;
        const found = data.users.find((u) => u.email?.toLowerCase() === target);
        if (found) return found.id;
        if (data.users.length < 1000) return null;
    }
    return null;
}

// Atualiza o "crachá" (token) de todos os usuários da igreja com o plano novo
async function refreshChurchClaims(churchId: string, ownerId: string | null) {
    const { data } = await supabase.from("church_users").select("user_id").eq("church_id", churchId);
    const ids = new Set<string>((data ?? []).map((r: { user_id: string }) => r.user_id));
    if (ownerId) ids.add(ownerId);
    for (const id of ids) {
        await supabase.rpc("refresh_church_claim", { p_user_id: id });
    }
}

export async function POST(req: Request) {
    try {
        const {
            plan_slug,
            billing_cycle = "monthly",
            installments: rawInstallments = 1,
            card_token,
            email: bodyEmail,
            name,
            document,
            phone,
            address,
        } = await req.json();

        if (!PAID_PLANS.includes(plan_slug)) return fail("Plano inválido", 400);
        if (billing_cycle !== "monthly" && billing_cycle !== "yearly") return fail("Ciclo inválido", 400);
        if (!card_token || !name || !document) return fail("Dados incompletos", 400);

        // 1) Plano no Pagar.me (mensal ou anual)
        const { data: planRow, error: planError } = await supabase
            .from("plans")
            .select("pagarme_plan_id, pagarme_yearly_plan_id, yearly_max_installments, active")
            .eq("plan_slug", plan_slug)
            .single();

        const pagarmePlanId =
            billing_cycle === "yearly" ? planRow?.pagarme_yearly_plan_id : planRow?.pagarme_plan_id;

        if (planError || !planRow?.active || !pagarmePlanId) {
            return fail("Plano não configurado para cobrança recorrente", 404);
        }

        const maxInstallments = billing_cycle === "yearly" ? Math.max(1, planRow.yearly_max_installments ?? 1) : 1;
        const installments = Math.min(maxInstallments, Math.max(1, Math.floor(Number(rawInstallments) || 1)));

        // 2) De qual igreja é a assinatura?
        let church: ChurchRow | null = null;
        let email: string | null = null;
        const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

        if (token) {
            // Logado: só o Pastor ativo da igreja pode assinar
            const { data: auth } = await supabase.auth.getUser(token);
            const user = auth?.user;
            if (!user) return fail("Sessão expirada. Faça login novamente.", 401);

            const { data: link } = await supabase
                .from("church_users")
                .select("church_id, role, status")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!link || link.role !== "pastor" || link.status !== "active") {
                return fail("Somente o Pastor da igreja pode alterar o plano.", 403);
            }

            const { data } = await supabase
                .from("church_profiles")
                .select("id, user_id, plan_slug, subscription_active, pagarme_subscription_id")
                .eq("id", link.church_id)
                .single<ChurchRow>();
            church = data ?? null;
            email = user.email ?? null;
        } else {
            // Cadastro (ainda sem login): pelo e-mail recém-cadastrado,
            // e só se a igreja ainda não tiver uma assinatura paga ativa
            if (!bodyEmail) return fail("Dados incompletos", 400);
            const userId = await findUserIdByEmail(String(bodyEmail));
            if (userId) {
                const { data } = await supabase
                    .from("church_profiles")
                    .select("id, user_id, plan_slug, subscription_active, pagarme_subscription_id")
                    .eq("user_id", userId)
                    .maybeSingle<ChurchRow>();
                church = data ?? null;
            }
            if (church?.subscription_active && church.pagarme_subscription_id) {
                return fail("Esta igreja já tem uma assinatura. Entre no sistema para mudar de plano.", 409);
            }
            email = String(bodyEmail);
        }

        if (!church || !email) return fail("Igreja não encontrada para esta conta.", 404);

        const pagarmeSecret = process.env.PAGARME_SECRET_KEY!;
        const auth = "Basic " + Buffer.from(pagarmeSecret + ":").toString("base64");
        const onlyDigits = (v: string) => v.replace(/\D/g, "");

        // O endereço de cobrança do CARTÃO é um objeto separado do endereço
        // do CLIENTE — a Pagar.me exige os dois preenchidos.
        if (!address) return fail("Endereço de cobrança do cartão é obrigatório", 400);
        const billingAddress = {
            line_1: address.line_1,
            zip_code: onlyDigits(address.zip_code),
            city: address.city,
            state: address.state,
            country: "BR",
        };

        // 3) Cria a assinatura
        const subRes = await fetch("https://api.pagar.me/core/v5/subscriptions", {
            method: "POST",
            headers: { Authorization: auth, "Content-Type": "application/json" },
            body: JSON.stringify({
                plan_id: pagarmePlanId,
                payment_method: "credit_card",
                installments,
                card: { token: card_token, billing_address: billingAddress },
                customer: {
                    name,
                    email,
                    type: "individual",
                    document: onlyDigits(document),
                    phones: phone
                        ? { mobile_phone: { country_code: "55", area_code: phone.area_code, number: phone.number } }
                        : undefined,
                    address: billingAddress,
                },
                metadata: { church_id: church.id, plan_slug, billing_cycle },
            }),
        });

        const subJson = await subRes.json();
        console.log("📤 Assinatura Pagar.me:", subJson?.id, subJson?.status);

        if (!subRes.ok || !subJson?.id) {
            console.error("❌ Erro ao criar assinatura:", subJson);
            return fail(subJson?.message || "Erro ao criar assinatura", 500, subJson);
        }

        // A Pagar.me pode responder 200 mesmo com a cobrança recusada ("failed")
        if (subJson.status === "failed") {
            await fetch(`https://api.pagar.me/core/v5/subscriptions/${subJson.id}`, {
                method: "DELETE",
                headers: { Authorization: auth },
            }).catch(() => {});

            return fail("Pagamento recusado pela operadora do cartão. Verifique os dados ou tente outro cartão.", 402);
        }

        // 4) Validade: fim do ciclo informado pelo Pagar.me (ou 30 dias / 1 ano)
        let expiresAt = subJson.current_cycle?.end_at ? new Date(subJson.current_cycle.end_at) : null;
        if (!expiresAt || isNaN(expiresAt.getTime())) {
            expiresAt = new Date();
            if (billing_cycle === "yearly") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            else expiresAt.setDate(expiresAt.getDate() + 30);
        }

        const previousSubscription = church.pagarme_subscription_id;

        await supabase
            .from("church_profiles")
            .update({
                plan_slug,
                billing_cycle,
                subscription_active: true,
                plan_expires_at: expiresAt.toISOString(),
                pagarme_customer_id: subJson.customer?.id ?? null,
                pagarme_subscription_id: subJson.id,
            })
            .eq("id", church.id);

        await refreshChurchClaims(church.id, church.user_id);

        // 5) Trocou de plano ou de ciclo: cancela a assinatura anterior
        //    (para não cobrar duas vezes)
        if (previousSubscription && previousSubscription !== subJson.id) {
            await fetch(`https://api.pagar.me/core/v5/subscriptions/${previousSubscription}`, {
                method: "DELETE",
                headers: { Authorization: auth, "Content-Type": "application/json" },
                body: JSON.stringify({ cancel_pending_invoices: true }),
            })
                .then((r) => console.log("↩️ Assinatura anterior cancelada:", previousSubscription, r.status))
                .catch((e) => console.error("⚠️ Não foi possível cancelar a assinatura anterior:", previousSubscription, e));
        }

        return NextResponse.json({ success: true, subscription_id: subJson.id });
    } catch (err) {
        console.error("❌ ERRO GERAL:", err);
        return fail("Erro interno", 500, String(err));
    }
}
