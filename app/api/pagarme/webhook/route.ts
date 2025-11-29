import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // precisa ser service role
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.type;
    const subscription = body.data?.id;

    console.log("WEBHOOK RECEBIDO:", body);

    if (!subscription) return NextResponse.json({ ok: true });

    switch (event) {
      case "subscription.paid":
        await supabase
          .from("church_profiles")
          .update({
            subscription_active: true,
          })
          .eq("pagarme_subscription_id", subscription);
        break;

      case "subscription.canceled":
      case "subscription.expired":
        await supabase
          .from("church_profiles")
          .update({
            subscription_active: false,
            plan_slug: "free",
          })
          .eq("pagarme_subscription_id", subscription);
        break;
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro webhook" }, { status: 500 });
  }
}
