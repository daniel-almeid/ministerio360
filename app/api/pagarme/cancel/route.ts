import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = supabaseServer(token);
    const { data: userData } = await supabase.auth.getUser();

    const user = userData.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: church } = await supabase
      .from("church_profiles")
      .select("id, pagarme_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!church?.pagarme_subscription_id) {
      return NextResponse.json({ error: "Nenhuma assinatura encontrada" });
    }

    const secret = process.env.PAGARME_SECRET_KEY!;
    const authHeader =
      "Basic " + Buffer.from(secret + ":").toString("base64");

    await fetch(
      `https://api.pagar.me/core/v5/subscriptions/${church.pagarme_subscription_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    await supabase
      .from("church_profiles")
      .update({
        subscription_active: false,
        current_period_end: null,
        pagarme_subscription_id: null,
        canceled_at: new Date().toISOString(),
      })
      .eq("id", church.id);

    await supabase.rpc("refresh_church_claim", {
      p_user_id: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao cancelar", detail: String(err) },
      { status: 500 }
    );
  }
}
