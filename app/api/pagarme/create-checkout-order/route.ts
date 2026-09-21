import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const { plan_slug, name, email } = await req.json();

    if (!plan_slug || !name || !email) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // PEGANDO PREÇO DIRETO DO SUPABASE

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("price_monthly")
      .eq("plan_slug", plan_slug)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Plano não encontrado no Supabase" },
        { status: 404 }
      );
    }

    const price_cents = Math.round(Number(plan.price_monthly) * 100);

    console.log("💰 PRICE DO SUPABASE:", price_cents);

    // PREPARANDO PEDIDO PARA O PAGAR.ME

    const pagarmeSecret = process.env.PAGARME_SECRET_KEY!;
    const auth = "Basic " + Buffer.from(pagarmeSecret + ":").toString("base64");

    const description = `Assinatura ${plan_slug.toUpperCase()}`;

    console.log("📦 ENVIANDO PEDIDO PARA PAGAR.ME");

    const orderRes = await fetch("https://api.pagar.me/core/v5/orders", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        closed: true,

        items: [
          {
            amount: price_cents,
            description,
            quantity: 1,
            code: plan_slug,
            type: "product",
          },
        ],

        customer: {
          name,
          email,
          type: "individual",
          document: "12345678909",
          mobile_phone: {
            country_code: "55",
            area_code: "11",
            number: "999999999",
          },
          address: {
            line_1: "Rua Teste 123",
            zip_code: "26282920",
            city: "Nova Iguaçu",
            state: "RJ",
            country: "BR",
          },
        },

        payments: [
          {
            payment_method: "checkout",
            checkout: {
              accepted_payment_methods: ["credit_card", "pix", "boleto"],
              accepted_brands: ["visa", "mastercard", "elo"],

              pix: { expires_in: 3600 },
              boleto: {
                due_at: new Date(Date.now() + 3 * 86400000).toISOString(),
              },

              customer_editable: true,
              billing_address_editable: true,

              success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/planos/assinatura?status=success`,
              cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/planos/assinatura?status=cancel`,
            },
          },
        ],
      }),
    });

    const json = await orderRes.json();
    console.log("📤 RESPOSTA DO PAGAR.ME:", json);

    if (!orderRes.ok || !json.checkouts?.[0]?.payment_url) {
      console.error("❌ Erro do Pagar.me:", json);
      return NextResponse.json(
        { error: "Erro ao criar pedido de checkout", detail: json },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_url: json.checkouts[0].payment_url,
    });

  } catch (err) {
    console.error("❌ ERRO GERAL:", err);
    return NextResponse.json(
      { error: "Erro interno", detail: String(err) },
      { status: 500 }
    );
  }
}