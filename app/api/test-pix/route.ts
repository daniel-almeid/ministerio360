import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const res = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      {
        items: [
          {
            title: "Teste Pix",
            quantity: 1,
            unit_price: 5.0,
          },
        ],
        payment_methods: {
          default_payment_method_id: "pix",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (e) {
    return NextResponse.json(
      { error: "erro", details: String(e) },
      { status: 500 }
    );
  }
}
