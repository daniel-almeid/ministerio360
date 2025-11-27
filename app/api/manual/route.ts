import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { plan_slug, email } = await req.json();

    if (!plan_slug || !email) {
      return NextResponse.json(
        { error: "plan_slug e email são obrigatórios" },
        { status: 400 }
      );
    }

    const mpToken = process.env.MP_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_URL;

    if (!mpToken || !baseUrl) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN ou NEXT_PUBLIC_URL não configurados" },
        { status: 500 }
      );
    }

    const value = plan_slug === "premium" ? 99.9 : 49.9;

    const preference = {
      payer: { email },
      items: [
        {
          title: `Plano ${plan_slug}`,
          quantity: 1,
          unit_price: value,
          currency_id: "BRL",
        },
      ],
      payment_methods: {
        excluded_payment_types: [], // aceita tudo (cartão, boleto, pix)
        installments: 1,
      },
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/falha`,
        pending: `${baseUrl}/pagamento/pendente`,
      },
      auto_return: "approved",
    };

    const { data } = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      preference,
      {
        headers: {
          Authorization: `Bearer ${mpToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      init_point: data.init_point,
      pix_qr_base64:
        data.point_of_interaction?.transaction_data?.qr_code_base64 || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao criar pagamento manual",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}
