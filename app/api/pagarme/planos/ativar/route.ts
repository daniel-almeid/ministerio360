import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const { plan_slug } = await req.json();

    if (!plan_slug) {
      return NextResponse.json({ error: "plan_slug é obrigatório" }, { status: 400 });
    }

    /** 
     * AQUI NÃO VALIDAMOS TOKEN.
     * Quem ativa plano definitivamente é o Webhook (order.paid).
     * Aqui ativamos temporariamente enquanto o pagamento não chega.
     */

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token não enviado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabaseUser.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });
    }

    // Carrega church profile pelo user_id
    const { data: profile } = await supabase
      .from("church_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    const now = new Date();
    const expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await supabase
      .from("church_profiles")
      .update({
        plan_slug,
        subscription_active: true,
        plan_expires_at: expires_at.toISOString()
      })
      .eq("id", profile.id);

    await supabase.rpc("refresh_church_claim", { p_user_id: user.id });

    return NextResponse.json({
      success: true,
      temporary: true,
      expires_at
    });

  } catch (err) {
    console.error("❌ ERRO AO ATIVAR PLANO:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}