// app/api/subscription-info/route.ts ou api/subscription-info/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
      return NextResponse.json(
        { error: "Missing MP_ACCESS_TOKEN" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.mercadopago.com/preapproval/search?payer_email=${encodeURIComponent(
        email
      )}`,
      {
        headers: { Authorization: `Bearer ${mpToken}` },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Erro ao consultar Mercado Pago", detail: text },
        { status: 500 }
      );
    }

    const data = await res.json();
    const subscription = data.results?.[0];

    if (!subscription) {
      return NextResponse.json({
        status: "none",
        next_payment_date: null,
        plan_id: null,
      });
    }

    return NextResponse.json({
      status: subscription.status,
      next_payment_date:
        subscription.auto_recurring?.next_payment_date || null,
      plan_id: subscription.preapproval_plan_id ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subscription info", detail: String(error) },
      { status: 500 }
    );
  }
}
