"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

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
                email,
                password,
            });

            if (loginError || !data?.user) {
                setError("E-mail ou senha incorretos.");
                setLoading(false);
                return;
            }

            await supabase.rpc("refresh_church_claim", { p_user_id: data.user.id });

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
                router.push("/planos");
                return;
            }

            router.push("/dashboard");

        } catch {
            setError("Erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-200 px-6 overflow-hidden">

            {(loading || navLoading) && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="animate-spin text-[#38B2AC] w-10 h-10" />
                        <p className="text-gray-700 font-medium animate-pulse">
                            {loading ? "Entrando..." : "Carregando..."}
                        </p>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleLogin}
                className="w-full max-w-lg p-12 md:p-20 space-y-10 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-300/50 shadow-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
                        Ministério<span className="text-[#38B2AC]">360</span>
                    </h1>
                    <p className="text-gray-600 text-base mt-3">Acesse sua conta</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl"
                            required
                        />

                        <div className="text-right mt-2">
                            <button
                                type="button"
                                onClick={() => navigateWithLoading("/login/reset-password")}
                                className="text-sm text-[#38B2AC] hover:underline"
                            >
                                Esqueci minha senha
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-2">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="w-5 h-5 accent-[#38B2AC]"
                        />
                        <label htmlFor="remember" className="text-gray-700 cursor-pointer">
                            Lembrar meus dados
                        </label>
                    </div>
                </div>

                {error && <p className="text-base text-red-500 text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || navLoading}
                    className="w-full flex items-center justify-center gap-2 text-white py-4 text-lg rounded-xl bg-[#38B2AC]"
                >
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Entrar"}
                </button>

                <button
                    type="button"
                    onClick={() => navigateWithLoading("/register")}
                    className="w-full mt-4 py-4 border border-[#38B2AC] text-[#38B2AC] rounded-xl"
                >
                    Criar conta
                </button>

                <p className="text-center text-sm text-gray-500 mt-10">
                    © {new Date().getFullYear()} Ministério360
                </p>

                <div className="mt-3 flex justify-center gap-6 text-sm">
                    <button
                        type="button"
                        onClick={() => navigateWithLoading("/termos")}
                        className="text-gray-600 hover:text-[#38B2AC] transition underline-offset-2 hover:underline"
                    >
                        Termos de Uso
                    </button>

                    <button
                        type="button"
                        onClick={() => navigateWithLoading("/privacidade")}
                        className="text-gray-600 hover:text-[#38B2AC] transition underline-offset-2 hover:underline"
                    >
                        Política de Privacidade
                    </button>
                </div>
                <div className="mt-2 flex justify-center text-sm">
                    <button
                        type="button"
                        onClick={() => navigateWithLoading("/excluir-conta")}
                        className="text-gray-400 hover:text-red-500 transition underline-offset-2 hover:underline"
                    >
                        Excluir minha conta
                    </button>
                </div>
            </form>
        </div>
    );
}
