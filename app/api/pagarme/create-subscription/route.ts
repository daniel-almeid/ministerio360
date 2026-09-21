export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: Request) {
    try {
        const {
            plan_slug,
            card_token,
            email,
            name,
            document,
            phone,
            address,
        } = await req.json();

        if (!plan_slug || !card_token || !email || !name || !document) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        // 1) Busca o plan_id do Pagar.me correspondente ao nosso slug
        const { data: planRow, error: planError } = await supabase
            .from("plans")
            .select("pagarme_plan_id")
            .eq("plan_slug", plan_slug)
            .single();

        if (planError || !planRow?.pagarme_plan_id) {
            return NextResponse.json(
                { error: "Plano não configurado para cobrança recorrente" },
                { status: 404 }
            );
        }

        const pagarmeSecret = process.env.PAGARME_SECRET_KEY!;
        const auth = "Basic " + Buffer.from(pagarmeSecret + ":").toString("base64");

        const onlyDigits = (v: string) => v.replace(/\D/g, "");

        // O endereço de cobrança do CARTÃO é um objeto separado do endereço
        // do CLIENTE — a Pagar.me exige os dois preenchidos, senão a cobrança
        // falha com "validation_error | billing | value is required".
        const billingAddress = address
            ? {
                  line_1: address.line_1,
                  zip_code: onlyDigits(address.zip_code),
                  city: address.city,
                  state: address.state,
                  country: "BR",
              }
            : undefined;

        if (!billingAddress) {
            return NextResponse.json(
                { error: "Endereço de cobrança do cartão é obrigatório" },
                { status: 400 }
            );
        }

        // 2) Cria a assinatura direto via API (sem passar pelo Checkout hospedado)
        const subRes = await fetch("https://api.pagar.me/core/v5/subscriptions", {
            method: "POST",
            headers: { Authorization: auth, "Content-Type": "application/json" },
            body: JSON.stringify({
                plan_id: planRow.pagarme_plan_id,
                payment_method: "credit_card",
                card: {
                    token: card_token,
                    billing_address: billingAddress,
                },
                customer: {
                    name,
                    email,
                    type: "individual",
                    document: onlyDigits(document),
                    phones: phone
                        ? {
                              mobile_phone: {
                                  country_code: "55",
                                  area_code: phone.area_code,
                                  number: phone.number,
                              },
                          }
                        : undefined,
                    address: billingAddress,
                },
            }),
        });

        const subJson = await subRes.json();
        console.log("📤 RESPOSTA DA ASSINATURA (completa):", JSON.stringify(subJson, null, 2));

        if (!subRes.ok || !subJson?.id) {
            console.error("❌ Erro ao criar assinatura:", subJson);
            return NextResponse.json(
                { error: subJson?.message || "Erro ao criar assinatura", detail: subJson },
                { status: 500 }
            );
        }

        // A Pagar.me pode responder 200 com um objeto de assinatura válido
        // mesmo quando a cobrança em si foi recusada — status "failed".
        if (subJson.status === "failed") {
            console.error("❌ Assinatura criada, mas a cobrança foi recusada:", subJson);

            // Cancela a assinatura recusada no Pagar.me para não deixar lixo lá
            await fetch(`https://api.pagar.me/core/v5/subscriptions/${subJson.id}`, {
                method: "DELETE",
                headers: { Authorization: auth },
            }).catch(() => {});

            return NextResponse.json(
                {
                    error:
                        "Pagamento recusado pela operadora do cartão. Verifique os dados ou tente outro cartão.",
                    detail: subJson,
                },
                { status: 402 }
            );
        }

        // 3) Localiza o usuário e o church_profile pra já guardar os IDs do Pagar.me
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const userAdmin = usersData?.users.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (userAdmin) {
            const { data: profile } = await supabase
                .from("church_profiles")
                .select("id")
                .eq("user_id", userAdmin.id)
                .single();

            if (profile) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                await supabase
                    .from("church_profiles")
                    .update({
                        plan_slug,
                        subscription_active: true,
                        plan_expires_at: expiresAt.toISOString(),
                        pagarme_customer_id: subJson.customer?.id ?? null,
                        pagarme_subscription_id: subJson.id,
                    })
                    .eq("id", profile.id);

                await supabase.rpc("refresh_church_claim", { p_user_id: userAdmin.id });
            }
        }

        return NextResponse.json({ success: true, subscription_id: subJson.id });
    } catch (err) {
        console.error("❌ ERRO GERAL:", err);
        return NextResponse.json({ error: "Erro interno", detail: String(err) }, { status: 500 });
    }
}