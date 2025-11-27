// app/api/checkout/route.ts ou api/checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { plan_slug } = await req.json();

    if (!plan_slug) {
      return NextResponse.json(
        { error: "plan_slug é obrigatório" },
        { status: 400 }
      );
    }

    const { data: plan, error } = await supabase
      .from("plans")
      .select("name, mp_plan_id")
      .eq("plan_slug", plan_slug)
      .single();

    if (error || !plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    if (!plan.mp_plan_id) {
      return NextResponse.json(
        { error: "Plano não possui mp_plan_id configurado" },
        { status: 500 }
      );
    }

    // URL oficial de checkout de assinatura do Mercado Pago
    const checkoutUrl =
      "https://www.mercadopago.com.br/subscriptions/checkout" +
      `?preapproval_plan_id=${encodeURIComponent(plan.mp_plan_id)}`;

    return NextResponse.json({
      status: "success",
      checkout_url: checkoutUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno", details: String(err) },
      { status: 500 }
    );
  }
}
