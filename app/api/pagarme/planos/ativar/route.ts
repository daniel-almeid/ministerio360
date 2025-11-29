import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token não enviado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    // Recebe qual plano o usuário pagou (free / standard / premium)
    const { plan_slug } = await req.json();
    if (!plan_slug) {
      return NextResponse.json({ error: "Plano não informado" }, { status: 400 });
    }

    // Busca o perfil da igreja
    const { data: profile } = await supabase
      .from("church_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // Calcula datas do ciclo
    const now = new Date();
    const expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // + 30 dias
    const reminder_at = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // + 25 dias

    // Atualiza plano
    await supabase
      .from("church_profiles")
      .update({
        plan_slug,
        subscription_active: true,
        plan_expires_at: expires_at.toISOString(),
        next_renewal_reminder: reminder_at.toISOString(),
        current_period_end: expires_at.toISOString().split("T")[0],
        canceled_at: null
      })
      .eq("id", profile.id);

    // Atualiza o JWT com os novos dados
    await supabase.rpc("refresh_church_claim", { p_user_id: user.id });

    return NextResponse.json({
      success: true,
      message: "Plano ativado com sucesso",
      plan_expires_at: expires_at,
    });

  } catch (err) {
    console.error("❌ ERRO AO ATIVAR PLANO:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
