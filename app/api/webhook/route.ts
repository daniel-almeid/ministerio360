// app/api/webhook/mercadopago/route.ts ou api/webhook/mercadopago/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const mpToken = process.env.MP_ACCESS_TOKEN!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY ou URL do Supabase não configurados");
}
if (!mpToken) {
  throw new Error("MP_ACCESS_TOKEN não configurado");
}

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mpTopic = body.type;

    if (!mpTopic) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Nos interessa apenas eventos de preapproval (assinaturas)
    if (mpTopic !== "preapproval") {
      return NextResponse.json({ received: true });
    }

    const preapprovalId = body.data?.id;
    if (!preapprovalId) {
      return NextResponse.json(
        { error: "Missing preapproval id" },
        { status: 400 }
      );
    }

    // Busca os dados completos da assinatura
    const mpRes = await fetch(
      `https://api.mercadopago.com/preapproval/${preapprovalId}`,
      {
        headers: {
          Authorization: `Bearer ${mpToken}`,
        },
      }
    );

    if (!mpRes.ok) {
      const text = await mpRes.text();
      return NextResponse.json(
        { error: "Erro ao consultar preapproval no Mercado Pago", detail: text },
        { status: 500 }
      );
    }

    const pre = await mpRes.json();

    const status: string = pre.status;
    const planId: string | undefined = pre.preapproval_plan_id;
    const email: string | undefined = pre.payer_email;

    if (!email || !planId) {
      return NextResponse.json(
        { error: "Missing email or preapproval_plan_id" },
        { status: 400 }
      );
    }

    // Busca usuário pelo e-mail
    const { data: usersData, error: usersError } =
      await adminSupabase.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { error: "Error fetching users", details: usersError.message },
        { status: 500 }
      );
    }

    const user = usersData.users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { error: "User not found for email " + email },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Descobre qual plano interno esse preapproval_plan_id representa
    const { data: plan, error: planError } = await adminSupabase
      .from("plans")
      .select("plan_slug")
      .eq("mp_plan_id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (status === "authorized" || status === "active") {
      await adminSupabase
        .from("church_profiles")
        .update({
          plan_slug: plan.plan_slug,
          subscription_active: true,
        })
        .eq("user_id", userId);

      await adminSupabase.rpc("refresh_church_claim", { p_user_id: userId });

      return NextResponse.json({
        success: true,
        updated_to: plan.plan_slug,
      });
    }

    if (status === "paused" || status === "cancelled") {
      await adminSupabase
        .from("church_profiles")
        .update({
          plan_slug: "free",
          subscription_active: false,
        })
        .eq("user_id", userId);

      await adminSupabase.rpc("refresh_church_claim", { p_user_id: userId });

      return NextResponse.json({
        success: true,
        updated_to: "free",
      });
    }

    return NextResponse.json({
      received: true,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook error", details: String(err) },
      { status: 500 }
    );
  }
}
