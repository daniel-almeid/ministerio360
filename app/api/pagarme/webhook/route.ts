export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// IMPORTANTE: usar SERVICE ROLE (não ANON)
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
    const body = await req.json();

    console.log("📥 WEBHOOK RECEBIDO:", JSON.stringify(body, null, 2));

    const event = body.type;
    const order = body.data;

    // EVENTO PRINCIPAL → order.paid
    if (event === "order.paid") {
      const email = order.customer?.email;
      const planSlug = order.items?.[0]?.code;

      console.log("🔍 Dados extraídos:", { email, planSlug });

      if (!email || !planSlug) {
        console.log("❌ Webhook ignorado: email ou plano ausente");
        return NextResponse.json({ ok: true });
      }

      console.log("🔥 PAGAMENTO APROVADO:", { email, planSlug });

      // 1. Buscar usuário pelo email no Supabase Auth
      const { data: userData, error: userErr } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", email)
        .single();

      if (userErr || !userData) {
        console.log("❌ Usuário não encontrado no Supabase:", userErr);
        return NextResponse.json({ ok: true });
      }

      const userId = userData.id;

      console.log("👤 Usuário encontrado:", userId);

      // 2. Buscar church_profile do usuário
      const { data: profile, error: profileErr } = await supabase
        .from("church_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileErr || !profile) {
        console.log("❌ Church Profile não encontrado:", profileErr);
        return NextResponse.json({ ok: true });
      }

      console.log("🏛 Church Profile encontrado:", profile.id);

      // 3. Gerar data de expiração → 30 dias a partir de agora
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      console.log("📅 Plano expira em:", expiresAt.toISOString());

      // 4. Atualizar church_profiles
      const { error: updateErr } = await supabase
        .from("church_profiles")
        .update({
          plan_slug: planSlug,
          subscription_active: true,
          plan_expires_at: expiresAt.toISOString(),
          current_period_end: expiresAt.toISOString().split("T")[0],
          next_renewal_reminder: null,
          canceled_at: null,
        })
        .eq("id", profile.id);

      if (updateErr) {
        console.log("❌ Erro ao atualizar church_profiles:", updateErr);
        return NextResponse.json({ ok: false });
      }

      console.log("✅ church_profiles atualizado com sucesso.");

      // 5. Atualizar JWT claims
      const { error: claimErr } = await supabase.rpc(
        "refresh_church_claim",
        { p_user_id: userId }
      );

      if (claimErr) {
        console.log("⚠️ Erro ao atualizar JWT claims:", claimErr);
      } else {
        console.log("🔑 JWT claims atualizadas com sucesso.");
      }

      console.log("🎉 PLANO ATIVADO COM SUCESSO PARA:", email);
    }

    // FINALIZA
    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("❌ ERRO GERAL NO WEBHOOK:", err);
    return NextResponse.json({ error: "Erro webhook" }, { status: 500 });
  }
}
