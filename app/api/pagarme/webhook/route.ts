export const runtime = "nodejs";

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
    // 1) Lê o body bruto (importante em webhooks)
    const body = await req.json();
    console.log("📥 WEBHOOK RECEBIDO:", JSON.stringify(body, null, 2));

    const event = body.type;
    const order = body.data;

    if (!event) {
      console.log("⚠️ Webhook sem 'type'. Ignorando.");
      return NextResponse.json({ ok: true });
    }

    if (event !== "order.paid") {
      console.log(`⚠️ Evento ignorado: ${event}`);
      return NextResponse.json({ ok: true });
    }

    // 2) Extrai dados essenciais
    const email = order?.customer?.email;
    const planSlug = order?.items?.[0]?.code;

    console.log("🔍 Dados extraídos:", { email, planSlug });

    if (!email || !planSlug) {
      console.log("❌ Faltam dados (email ou planSlug).");
      return NextResponse.json({ ok: true });
    }

    console.log("🔥 PAGAMENTO APROVADO:", { email, planSlug });

    // 3) BUSCAR O USUÁRIO NO SUPABASE
    const { data: users, error: listErr } = await supabase.auth.admin.listUsers();

    if (listErr || !users) {
      console.log("❌ Erro ao listar usuários:", listErr);
      return NextResponse.json({ ok: true });
    }

    const userAdmin = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!userAdmin) {
      console.log("❌ Usuário não encontrado pelo email:", email);
      return NextResponse.json({ ok: true });
    }

    const userId = userAdmin.id;

    console.log("👤 Usuário encontrado:", userId);

    // 4) Buscar church_profile desse usuário
    const { data: profile, error: profileErr } = await supabase
      .from("church_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileErr || !profile) {
      console.log("❌ Church profile não encontrado:", profileErr);
      return NextResponse.json({ ok: true });
    }

    console.log("🏛 Profile encontrado:", profile.id);

    // 5) Calcula data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 6) Atualizar church_profiles
    const { error: updateErr } = await supabase
      .from("church_profiles")
      .update({
        plan_slug: planSlug,
        subscription_active: true,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq("id", profile.id);

    if (updateErr) {
      console.log("❌ Erro ao atualizar church_profiles:", updateErr);
      return NextResponse.json({ ok: true });
    }

    console.log("✅ church_profiles atualizado com sucesso!");

    // 7) Atualizar JWT claims
    const { error: claimErr } = await supabase.rpc("refresh_church_claim", {
      p_user_id: userId,
    });

    if (claimErr) {
      console.log("⚠️ Erro ao atualizar JWT claims:", claimErr);
    } else {
      console.log("🔑 JWT claims atualizadas com sucesso.");
    }

    console.log("🎉 PLANO ATIVADO COM SUCESSO PARA:", email);

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("❌ ERRO GERAL NO WEBHOOK:", err);
    return NextResponse.json({ error: "Erro webhook" }, { status: 500 });
  }
}
