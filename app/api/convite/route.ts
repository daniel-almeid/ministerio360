export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cria a conta de quem recebeu um convite.
// A conta já nasce com o e-mail confirmado (quem tem o link foi convidado pelo pastor),
// então não depende do envio de e-mail do Supabase.
// A entrada na igreja é feita pelo banco (handle_new_user), que confere o convite de novo.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_MESSAGE: Record<string, string> = {
    used: "Este convite já foi usado.",
    revoked: "Este convite foi cancelado pelo pastor.",
    expired: "Este convite expirou. Peça um novo ao pastor.",
    full: "A igreja atingiu o limite de usuários do plano. Fale com o pastor.",
};

function fail(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const token = String(body?.token ?? "");
        const name = String(body?.name ?? "").trim().slice(0, 120);
        const email = String(body?.email ?? "").trim().toLowerCase();
        const password = String(body?.password ?? "");

        if (!UUID.test(token)) return fail("Convite inválido.", 404);
        if (name.length < 2) return fail("Informe seu nome.");
        if (!EMAIL.test(email) || email.length > 254) return fail("Confira o e-mail digitado.");
        if (password.length < 6 || password.length > 72) return fail("A senha precisa ter pelo menos 6 caracteres.");

        const { data: invite, error: inviteError } = await supabase.rpc("get_church_invite", { p_token: token });
        if (inviteError) return fail("Não foi possível conferir o convite. Tente de novo.", 500);
        if (!invite?.found) return fail("Convite inválido.", 404);
        if (invite.status !== "valid") return fail(STATUS_MESSAGE[invite.status] ?? "Convite indisponível.", 409);
        if (invite.email && invite.email !== email) {
            return fail(`Este convite foi enviado para ${invite.email}. Use esse e-mail.`);
        }

        const { error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, invite_token: token },
        });

        if (error) {
            const message = String(error.message ?? "").toLowerCase();
            if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
                return fail("Este e-mail já tem uma conta no Ministério360. Use outro e-mail.", 409);
            }
            if (message.includes("password")) {
                return fail("Escolha uma senha mais forte.");
            }
            console.error("Erro ao aceitar convite:", error.message);
            return fail("Não foi possível criar sua conta. Peça um novo convite ao pastor.", 500);
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Erro geral no convite:", err);
        return fail("Erro inesperado. Tente de novo.", 500);
    }
}
