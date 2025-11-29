import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: Request) {
  try {
    const { plan_slug } = await req.json();

    if (!plan_slug) {
      return NextResponse.json(
        { error: "plan_slug é obrigatório" },
        { status: 400 }
      );
    }

    const { data: plan, error } = await supabase
      .from("plans")
      .select("name, pagarme_plan_id")
      .eq("plan_slug", plan_slug)
      .single();

    if (error) {
      console.error("Erro ao buscar plano:", error);
      return NextResponse.json(
        { error: "Erro ao buscar plano", details: error.message },
        { status: 500 }
      );
    }

    if (!plan?.pagarme_plan_id) {
      return NextResponse.json(
        { error: "Plano não configurado no banco" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ready: true,
      pagarme_plan_id: plan.pagarme_plan_id,
      plan_name: plan.name,
      plan_slug,
    });
  } catch (err) {
    console.error("Erro interno na rota checkout:", err);
    return NextResponse.json(
      { error: "Erro interno", details: String(err) },
      { status: 500 }
    );
  }
}
