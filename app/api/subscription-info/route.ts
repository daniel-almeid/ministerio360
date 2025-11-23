import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    const res = await axios.get(
      `https://api.mercadopago.com/preapproval/search?payer_email=${email}`,
      {
        headers: { Authorization: `Bearer ${mpToken}` },
      }
    );

    const subscription = res.data.results?.[0];

    if (!subscription) {
      return NextResponse.json({
        status: "none",
        next_payment_date: null,
      });
    }

    return NextResponse.json({
      status: subscription.status,
      next_payment_date: subscription.auto_recurring?.next_payment_date || null,
      plan_id: subscription.preapproval_plan_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subscription info", detail: String(error) },
      { status: 500 }
    );
  }
}
