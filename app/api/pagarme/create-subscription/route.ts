export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

const PAID_PLANS = ["standard", "premium_basic", "premium"];

// Cadastro sem login: só vale para conta recém-criada (o pagamento acontece logo
// depois do cadastro), de igreja que nunca assinou e com poucas tentativas.
// Fora disso a pessoa entra no sistema e assina logada.
const SIGNUP_WINDOW_MS = 60 * 60 * 1000;
const SIGNUP_MAX_ATTEMPTS = 5;
const SIGNUP_LOGIN_REQUIRED = "Para assinar, entre no sistema com a sua conta.";

type ChurchRow = {
    id: string;
    user_id: string | null;
    plan_slug: string | null;
    subscription_active: boolean | null;
    pagarme_customer_id: string | null;
    pagarme_subscription_id: string | null;
    billing_provider: string | null;
};

// Igreja com assinatura ativa pela loja do celular não assina de novo pelo cartão (pagaria duas vezes)
const STORE_PROVIDERS = ["google_play", "app_store"];
const PAYS_THROUGH_STORE =
    "A assinatura da sua igreja é feita pela Google Play. Para mudar de plano ou cancelar, use o aplicativo ou a Google Play.";

function fail(error: string, status: number, detail?: unknown) {
    return NextResponse.json({ error, ...(detail ? { detail } : {}) }, { status });
}

// Procura a conta pelo e-mail (usado só no cadastro, quando ainda não há login)
async function findUserByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase();
    for (let page = 1; page <= 50; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error || !data) return null;
        const found = data.users.find((u) => u.email?.toLowerCase() === target);
        if (found) return found;
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
            user_id: bodyUserId,
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
        let signupUser: User | null = null;
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
                .select("id, user_id, plan_slug, subscription_active, pagarme_customer_id, pagarme_subscription_id, billing_provider")
                .eq("id", link.church_id)
                .single<ChurchRow>();
            church = data ?? null;
            email = user.email ?? null;
        } else {
            // Cadastro (ainda sem login): pelo e-mail recém-cadastrado + o id da conta,
            // que só o navegador que fez o cadastro recebeu (quem só sabe o e-mail não passa).
            // Qualquer recusa dá a mesma resposta, para não revelar quais e-mails têm conta.
            if (!bodyEmail) return fail("Dados incompletos", 400);
            const signupEmail = String(bodyEmail).trim();
            signupUser = await findUserByEmail(signupEmail);
            const createdAt = signupUser ? new Date(signupUser.created_at).getTime() : NaN;
            if (!signupUser || signupUser.id !== bodyUserId || !(Date.now() - createdAt <= SIGNUP_WINDOW_MS)) {
                return fail(SIGNUP_LOGIN_REQUIRED, 401);
            }

            const { data } = await supabase
                .from("church_profiles")
                .select("id, user_id, plan_slug, subscription_active, pagarme_customer_id, pagarme_subscription_id, billing_provider")
                .eq("user_id", signupUser.id)
                .maybeSingle<ChurchRow>();
            church = data ?? null;
            if (!church || church.pagarme_subscription_id || church.pagarme_customer_id) {
                return fail(SIGNUP_LOGIN_REQUIRED, 401);
            }
            if ((Number(signupUser.app_metadata?.signup_payment_attempts) || 0) >= SIGNUP_MAX_ATTEMPTS) {
                return fail(SIGNUP_LOGIN_REQUIRED, 401);
            }
            email = signupEmail;
        }

        if (!church || !email) return fail("Igreja não encontrada para esta conta.", 404);
        if (church.subscription_active && STORE_PROVIDERS.includes(church.billing_provider ?? "")) {
            return fail(PAYS_THROUGH_STORE, 409);
        }

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

        // Cadastro sem login: conta a tentativa antes de cobrar (barra teste de cartões em série).
        // A soma é feita no banco numa operação só: pedidos ao mesmo tempo não furam o limite.
        if (signupUser) {
            const { data: attempt, error: countError } = await supabase.rpc("claim_signup_payment_attempt", {
                p_user_id: signupUser.id,
                p_max: SIGNUP_MAX_ATTEMPTS,
            });
            if (countError) return fail("Erro interno", 500);
            if (attempt == null) return fail(SIGNUP_LOGIN_REQUIRED, 401);
        }

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

        // Grava só se a igreja ainda estiver como foi lida. Dois pedidos ao mesmo tempo
        // (duas abas, a rede reenviando) não deixam uma assinatura esquecida cobrando.
        const save = supabase
            .from("church_profiles")
            .update({
                plan_slug,
                billing_cycle,
                subscription_active: true,
                plan_expires_at: expiresAt.toISOString(),
                canceled_at: null, // nova assinatura: renovação automática ligada de novo
                pagarme_customer_id: subJson.customer?.id ?? null,
                pagarme_subscription_id: subJson.id,
                // Passa a pagar pelo site (inclusive quem estava no mês grátis de indicação)
                billing_provider: "pagarme",
            })
            .eq("id", church.id);
        const { data: saved, error: saveError } = await (previousSubscription
            ? save.eq("pagarme_subscription_id", previousSubscription)
            : save.is("pagarme_subscription_id", null)
        ).select("id");

        if (saveError) {
            console.error("❌ Erro ao gravar a assinatura na igreja:", church.id, subJson.id, saveError);
        } else if (!saved?.length) {
            // Outro pedido gravou antes: cancela esta para não cobrar todo mês em dobro.
            // A 1ª cobrança dela já foi feita e precisa ser estornada no painel do Pagar.me.
            console.error("⚠️ Assinatura em duplicidade cancelada; estornar a 1ª cobrança:", church.id, subJson.id);
            await fetch(`https://api.pagar.me/core/v5/subscriptions/${subJson.id}`, {
                method: "DELETE",
                headers: { Authorization: auth, "Content-Type": "application/json" },
                body: JSON.stringify({ cancel_pending_invoices: true }),
            }).catch(() => {});
            return fail("Este pagamento já foi registrado. Atualize a página para ver o seu plano.", 409);
        }

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
