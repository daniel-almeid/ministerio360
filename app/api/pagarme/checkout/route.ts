import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: Request) {
  try {
    const { plan_slug } = await req.json();

    if (!plan_slug) {
      return NextResponse.json({ error: "plan_slug é obrigatório" }, { status: 400 });
    }

    const { data: plan } = await supabase
      .from("plans")
      .select("name, pagarme_plan_id")
      .eq("plan_slug", plan_slug)
      .single();

    if (!plan?.pagarme_plan_id) {
      return NextResponse.json({ error: "Plano não configurado no banco" }, { status: 400 });
    }

    return NextResponse.json({
      ready: true,
      pagarme_plan_id: plan.pagarme_plan_id,
      plan_name: plan.name,
      plan_slug,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno", details: String(err) },
      { status: 500 }
    );
  }
}
