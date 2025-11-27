import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

export async function POST(req: Request) {
  try {
    // carregamento de env SOMENTE dentro da função
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const mpToken = process.env.MP_ACCESS_TOKEN;

    if (!supabaseUrl || !serviceRoleKey || !mpToken) {
      console.error("Variáveis ausentes");
      return NextResponse.json(
        { error: "Configuração faltando" },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body = await req.json();

    if (body.type !== "preapproval") {
      return NextResponse.json({ received: true });
    }

    const preapprovalId = body.data?.id;
    if (!preapprovalId) {
      return NextResponse.json(
        { error: "Missing preapproval id" },
        { status: 400 }
      );
    }

    // consulta no MP
    const mpRes = await axios.get(
      `https://api.mercadopago.com/preapproval/${preapprovalId}`,
      { headers: { Authorization: `Bearer ${mpToken}` } }
    );

    const pre = mpRes.data;
    const email = pre.payer_email;
    const planId = pre.preapproval_plan_id;
    const status = pre.status;

    if (!email || !planId) {
      return NextResponse.json(
        { error: "Missing email or plan" },
        { status: 400 }
      );
    }

    // procura usuário diretamente no auth.users
    const { data: user, error: userError } = await adminSupabase
      .from("auth.users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found for email " + email },
        { status: 404 }
      );
    }

    const userId = user.id;

    // pega slug do plano
    const { data: plan } = await adminSupabase
      .from("plans")
      .select("plan_slug")
      .eq("mp_plan_id", planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // STATUS OK → atualizar plano
    if (status === "authorized" || status === "active") {
      await adminSupabase
        .from("church_profiles")
        .update({
          plan_slug: plan.plan_slug,
          subscription_active: true
        })
        .eq("user_id", userId);

      await adminSupabase.rpc("refresh_church_claim", { p_user_id: userId });

      return NextResponse.json({
        success: true,
        updated_to: plan.plan_slug
      });
    }

    // Cancelado → volta pro free
    if (status === "paused" || status === "cancelled") {
      await adminSupabase
        .from("church_profiles")
        .update({
          plan_slug: "free",
          subscription_active: false
        })
        .eq("user_id", userId);

      await adminSupabase.rpc("refresh_church_claim", { p_user_id: userId });

      return NextResponse.json({
        success: true,
        updated_to: "free"
      });
    }

    return NextResponse.json({ received: true, status });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook error", details: String(err) },
      { status: 500 }
    );
  }
}
