import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// IMPORTANTE: usar SERVICE ROLE (não ANON)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
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
      const userId = order.customer?.id;

      console.log("🔍 Dados extraídos:", { email, planSlug, userId });

      if (!email || !planSlug || !userId) {
        console.log("❌ Erro: email, plano ou userId ausente");
        return NextResponse.json({ ok: true });
      }

      console.log("🔥 PAGAMENTO APROVADO:", { email, planSlug });

      // 1. Buscar church_profile pelo user_id
      const { data: profile, error: profileErr } = await supabase
        .from("church_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileErr || !profile) {
        console.log("❌ Church Profile não encontrado:", profileErr);
        return NextResponse.json({ ok: true });
      }

      const churchId = profile.id;

      // 2. Gerar data de expiração → 30 dias a partir de agora
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      console.log("📅 Plano expira em:", expiresAt.toISOString());

      // 3. Atualizar church_profiles
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
        .eq("id", churchId);

      if (updateErr) {
        console.log("❌ Erro ao atualizar church_profiles:", updateErr);
        return NextResponse.json({ ok: false });
      }

      console.log("✅ church_profiles atualizado com sucesso.");

      // 4. Atualizar JWT claims (Super importante)
      const { error: claimErr } = await supabase.rpc(
        "refresh_church_claim",
        { p_user_id: profile.user_id }
      );

      if (claimErr) {
        console.log("⚠️ Erro ao atualizar JWT claims:", claimErr);
      } else {
        console.log("🔑 JWT claims atualizadas com sucesso.");
      }

      console.log("🎉 PLANO ATIVADO COM SUCESSO PARA:", email);
    }

    // FINISH
    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("❌ ERRO GERAL NO WEBHOOK:", err);
    return NextResponse.json({ error: "Erro webhook" }, { status: 500 });
  }
}
