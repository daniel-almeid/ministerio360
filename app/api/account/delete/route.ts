export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
        }

        // 1) Autentica com e-mail + senha para confirmar que é o dono da conta
        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: signInData, error: signInError } =
            await supabaseAuth.auth.signInWithPassword({ email, password });

        if (signInError || !signInData.user) {
            return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
        }

        const userId = signInData.user.id;

        // 2) Busca o church_profile e cancela a assinatura no Pagar.me, se houver
        const { data: profile } = await supabase
            .from("church_profiles")
            .select("id, pagarme_subscription_id")
            .eq("user_id", userId)
            .single();

        if (profile?.pagarme_subscription_id) {
            const pagarmeSecret = process.env.PAGARME_SECRET_KEY!;
            const auth = "Basic " + Buffer.from(pagarmeSecret + ":").toString("base64");

            await fetch(
                `https://api.pagar.me/core/v5/subscriptions/${profile.pagarme_subscription_id}`,
                { method: "DELETE", headers: { Authorization: auth } }
            ).catch(() => {

            });
        }

        // 3) Apaga o church_profile 
        if (profile?.id) {
            await supabase.from("church_profiles").delete().eq("id", profile.id);
        }

        // 4) Apaga o usuário do Supabase Auth
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("❌ Erro ao apagar usuário:", deleteError);
            return NextResponse.json(
                { error: "Dados da igreja apagados, mas houve um erro ao remover a conta de login. Entre em contato com o suporte." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("❌ ERRO GERAL:", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}