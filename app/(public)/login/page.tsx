"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import PasswordInput from "../../../components/shared/passwordInput";
import { authErrorMessage } from "../../../lib/authErrors";
import {
    AuthError,
    AuthLabel,
    AuthLayout,
    AuthTitle,
    Divider,
    FieldBox,
    authInput,
    outlineButton,
    primaryButton,
} from "../../../components/auth/authShell";
import { track } from "../../../lib/analytics";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false); // loading do login
    const [navLoading, setNavLoading] = useState(false); // loading da navegação
    const [error, setError] = useState("");

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRemember(true);
        }
    }, []);

    function navigateWithLoading(path: string) {
        setNavLoading(true);
        setTimeout(() => {
            router.push(path);
        }, 150);
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (loginError || !data?.user) {
                setError(authErrorMessage(loginError, "Não foi possível entrar. Tente novamente."));
                setLoading(false);
                return;
            }

            await supabase.rpc("refresh_church_claim", { p_user_id: data.user.id });
            track("login_feito");

            const { data: newSession } = await supabase.auth.refreshSession();
            if (newSession?.session) {
                await supabase.auth.setSession({
                    access_token: newSession.session.access_token,
                    refresh_token: newSession.session.refresh_token,
                });
            }

            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;

            const plan = user?.app_metadata?.plan_slug || "free";
            const active = user?.app_metadata?.subscription_active ?? false;

            if (remember) localStorage.setItem("rememberedEmail", email);
            else localStorage.removeItem("rememberedEmail");

            if (plan !== "free" && active === false) {
                router.push("/planos?pagar=1");
                return;
            }

            router.push("/dashboard");

        } catch (err) {
            setError(authErrorMessage(err as { message?: string }, "Não foi possível entrar. Tente novamente."));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            {(loading || navLoading) && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="animate-spin text-[#0F766E] w-10 h-10" />
                        <p className="text-gray-700 font-medium animate-pulse">
                            {loading ? "Entrando..." : "Carregando..."}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <AuthTitle title="Que bom te ver!" subtitle="Entre com o e-mail e a senha da sua conta." />

                <div>
                    <AuthLabel htmlFor="email">E-mail</AuthLabel>
                    <FieldBox icon={Mail}>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            placeholder="seu@email.com"
                            className={authInput}
                            required
                        />
                    </FieldBox>
                </div>

                <div>
                    <AuthLabel htmlFor="password">Senha</AuthLabel>
                    <FieldBox icon={Lock}>
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="Sua senha"
                            className={authInput}
                            required
                        />
                    </FieldBox>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <label htmlFor="remember" className="flex items-center gap-2.5 text-[14px] text-gray-700 cursor-pointer">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="w-5 h-5 accent-[#0F766E]"
                        />
                        Lembrar meus dados
                    </label>

                    <button
                        type="button"
                        onClick={() => navigateWithLoading("/login/reset-password")}
                        className="text-[14px] font-bold text-[#0F766E] hover:underline"
                    >
                        Esqueci minha senha
                    </button>
                </div>

                <AuthError message={error} />

                <button type="submit" disabled={loading || navLoading} className={primaryButton}>
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Entrar"}
                </button>

                <Divider text="ainda não usa o Ministério360?" />

                <button type="button" onClick={() => navigateWithLoading("/register")} className={outlineButton}>
                    Criar conta da igreja
                </button>

                <div className="pt-4 text-center text-[13px] text-gray-500 space-y-2">
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
                        <button
                            type="button"
                            onClick={() => navigateWithLoading("/termos")}
                            className="hover:text-[#0F766E] hover:underline underline-offset-2"
                        >
                            Termos de Uso
                        </button>
                        <button
                            type="button"
                            onClick={() => navigateWithLoading("/privacidade")}
                            className="hover:text-[#0F766E] hover:underline underline-offset-2"
                        >
                            Política de Privacidade
                        </button>
                        <button
                            type="button"
                            onClick={() => navigateWithLoading("/excluir-conta")}
                            className="text-gray-400 hover:text-red-500 hover:underline underline-offset-2"
                        >
                            Excluir minha conta
                        </button>
                    </div>
                    <p>© {new Date().getFullYear()} Ministério360</p>
                </div>
            </form>
        </AuthLayout>
    );
}
