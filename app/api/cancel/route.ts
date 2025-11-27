import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
      return NextResponse.json({ error: "MP_ACCESS_TOKEN não configurado" }, { status: 500 });
    }

    // pega token enviado pelo frontend
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }

    // supabase funcionando no backend
    const supabase = supabaseServer(token);

    const { data: userInfo } = await supabase.auth.getUser();
    const user = userInfo?.user;

    if (!user?.email || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.email;
    const userId = user.id;

    // Busca assinatura no Mercado Pago
    const res = await fetch(
      `https://api.mercadopago.com/preapproval/search?payer_email=${email}`,
      { headers: { Authorization: `Bearer ${mpToken}` } }
    );

    const search = await res.json();
    const subscription = search.results?.[0];

    if (!subscription) {
      return NextResponse.json({
        success: false,
        message: "Nenhuma assinatura ativa encontrada",
      });
    }

    const preId = subscription.id;

    // Pausa assinatura
    await fetch(`https://api.mercadopago.com/preapproval/${preId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "paused" }),
    });

    // Atualiza Supabase
    await supabase
      .from("church_profiles")
      .update({
        plan_slug: "free",
        subscription_active: false,
      })
      .eq("user_id", userId);

    await supabase.rpc("refresh_church_claim", { p_user_id: userId });

    return NextResponse.json({ success: true, updated_to: "free" });

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao cancelar assinatura", detail: String(error) },
      { status: 500 }
    );
  }
}
