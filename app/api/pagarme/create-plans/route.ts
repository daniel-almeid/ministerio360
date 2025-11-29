import { NextResponse } from "next/server";

export async function GET() {
  try {
    const secret = process.env.PAGARME_SECRET_KEY!;
    if (!secret) {
      return NextResponse.json({ error: "Missing PAGARME_SECRET_KEY" }, { status: 500 });
    }

    const authHeader =
      "Basic " + Buffer.from(secret + ":").toString("base64");

    async function createPlan(name: string, price: number) {
      const res = await fetch("https://api.pagar.me/core/v5/plans", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          interval: "month",
          interval_count: 1,
          billing_type: "prepaid",
          payment_methods: ["credit_card"],
          installments: [1],

          quantity: 1,

          pricing_scheme: {
            price,
            scheme_type: "unit"
          }
        }),
      });

      const json = await res.json();
      return json;
    }

    const free = await createPlan("Plano Free", 0);
    const standard = await createPlan("Plano Standard", 4990);
    const premium = await createPlan("Plano Premium", 8990);

    return NextResponse.json({
      success: true,
      free,
      standard,
      premium
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao criar planos", detail: String(err) },
      { status: 500 }
    );
  }
}
