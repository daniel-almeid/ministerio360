"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import Link from "next/link";
import { KeyRound, Loader2, Mail, MailCheck } from "lucide-react";
import { AuthLabel, AuthLayout, AuthTitle, FieldBox, authInput, outlineButton, primaryButton } from "../../../../components/auth/authShell";

// Redirecionamento inteligente
const redirectUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/login/reset-password/update"
    : "https://ministerio360.vercel.app/login/reset-password/update";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSend() {
        setLoading(true);

        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        setSent(true);
        setLoading(false);
    }

    return (
        <AuthLayout backHref="/login">
            {!sent ? (
                <div className="space-y-5">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F7F5] text-[#0F766E]">
                        <KeyRound className="h-7 w-7" />
                    </span>

                    <AuthTitle
                        title="Recuperar senha"
                        subtitle="Vamos enviar um link para você criar uma senha nova."
                    />

                    <div>
                        <AuthLabel htmlFor="email">Digite seu e-mail</AuthLabel>
                        <FieldBox icon={Mail}>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                autoComplete="email"
                                className={authInput}
                                required
                            />
                        </FieldBox>
                    </div>

                    <button onClick={handleSend} disabled={loading} className={primaryButton}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Enviar link"}
                    </button>
                </div>
            ) : (
                <div className="space-y-5 text-center">
                    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F7F5] text-[#0F766E]">
                        <MailCheck className="h-10 w-10" />
                    </span>
                    <h1 className="text-[26px] font-extrabold text-[#1E3A5F]">E-mail enviado!</h1>
                    <p className="text-[15px] text-gray-600">
                        Se o e-mail existir, você receberá um link para redefinir sua senha.
                    </p>
                    <Link href="/login" className={outlineButton}>
                        Voltar ao login
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
}
