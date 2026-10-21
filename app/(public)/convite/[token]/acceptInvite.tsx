"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, LinkIcon, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";
import { ROLE_HINT, ROLE_LABEL, isRole } from "../../../(protected)/usuarios/users/permissions";

type Invite = {
    found: true;
    status: "valid" | "used" | "revoked" | "expired" | "full";
    church: string | null;
    role: string;
    name: string | null;
    email: string | null;
    expires_at: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_TEXT: Record<Exclude<Invite["status"], "valid">, { title: string; text: string }> = {
    used: { title: "Convite já usado", text: "Este link já foi usado para criar uma conta. Se foi você, é só entrar com seu e-mail e senha." },
    revoked: { title: "Convite cancelado", text: "O pastor cancelou este convite. Peça um novo, se precisar." },
    expired: { title: "Convite expirado", text: "Este link venceu. Peça um novo convite ao pastor." },
    full: { title: "Limite de usuários", text: "A igreja atingiu o limite de usuários do plano. Fale com o pastor." },
};

export function AcceptInvite({ token }: { token: string }) {
    const [invite, setInvite] = useState<Invite | null>(null);
    const [state, setState] = useState<"loading" | "invalid" | "error" | "ready" | "done">("loading");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!UUID.test(token)) {
            setState("invalid");
            return;
        }
        supabase.rpc("get_church_invite", { p_token: token }).then(({ data, error }) => {
            if (error) return setState("error");
            if (!data?.found) return setState("invalid");
            setInvite(data as Invite);
            setName((data as Invite).name ?? "");
            setEmail((data as Invite).email ?? "");
            setState("ready");
        });
    }, [token]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (name.trim().length < 2) return setError("Informe seu nome.");
        if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
        if (password !== confirm) return setError("As senhas não conferem.");

        setSending(true);
        try {
            const res = await fetch("/api/convite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, name: name.trim(), email: email.trim(), password }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(body?.error ?? "Não foi possível criar sua conta.");
                setSending(false);
                return;
            }

            // Conta criada: entra direto
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });
            if (loginError || !data.user) {
                setState("done");
                setSending(false);
                return;
            }
            await supabase.rpc("refresh_church_claim", { p_user_id: data.user.id });
            await supabase.auth.refreshSession();
            setState("done");
            window.location.href = "/dashboard";
        } catch {
            setError("Sem conexão. Verifique a internet e tente de novo.");
            setSending(false);
        }
    }

    const roleLabel = invite && isRole(invite.role) ? ROLE_LABEL[invite.role] : invite?.role;
    const roleHint = invite && isRole(invite.role) ? ROLE_HINT[invite.role] : "";

    return (
        <main className="min-h-dvh bg-gray-50 flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo360-cor.png" alt="Ministério360" className="h-9 w-auto" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {state === "loading" && (
                        <div className="flex flex-col items-center gap-3 py-10 text-gray-500">
                            <Loader2 className="w-7 h-7 animate-spin text-[#38B2AC]" />
                            <p className="text-sm">Carregando convite...</p>
                        </div>
                    )}

                    {(state === "invalid" || state === "error") && (
                        <Message
                            title={state === "invalid" ? "Link inválido" : "Algo deu errado"}
                            text={
                                state === "invalid"
                                    ? "Este convite não existe. Confira o link ou peça um novo ao pastor."
                                    : "Não foi possível carregar o convite. Verifique a internet e abra o link de novo."
                            }
                        />
                    )}

                    {state === "ready" && invite && invite.status !== "valid" && (
                        <Message {...STATUS_TEXT[invite.status]} showLogin={invite.status === "used"} />
                    )}

                    {state === "done" && (
                        <div className="flex flex-col items-center text-center gap-3 py-6">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-lg font-bold text-gray-800">Conta criada!</h1>
                            <p className="text-sm text-gray-500">Entrando no sistema...</p>
                            <a href="/login" className="text-sm font-semibold text-[#0F766E] hover:underline">
                                Ir para o login
                            </a>
                        </div>
                    )}

                    {state === "ready" && invite?.status === "valid" && (
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Você foi convidado(a) para</p>
                                <h1 className="text-xl font-bold text-gray-800">{invite.church ?? "a igreja"}</h1>
                                <div className="mt-3 rounded-xl bg-[#E6FFFA] px-4 py-3">
                                    <p className="text-sm font-semibold text-[#0F766E]">{roleLabel}</p>
                                    {roleHint && <p className="text-xs text-[#0F766E]/80 mt-0.5">{roleHint}</p>}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">Crie seu acesso. Você vai entrar sempre com este e-mail e senha.</p>

                            <Input label="Seu nome" value={name} onChange={setName} autoComplete="name" />
                            <Input
                                label="E-mail"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                autoComplete="email"
                                disabled={!!invite.email}
                                hint={invite.email ? "O convite foi enviado para este e-mail." : undefined}
                            />
                            <div className="relative">
                                <Input
                                    label="Crie uma senha"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={setPassword}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-[34px] text-gray-400"
                                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <Input
                                label="Confirme a senha"
                                type={showPassword ? "text" : "password"}
                                value={confirm}
                                onChange={setConfirm}
                                autoComplete="new-password"
                            />

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full h-12 rounded-xl bg-[#38B2AC] hover:bg-[#319795] disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2"
                            >
                                {sending && <Loader2 className="w-5 h-5 animate-spin" />}
                                Criar meu acesso e entrar
                            </button>

                            <p className="text-xs text-gray-500 flex items-center gap-1.5 justify-center">
                                <Smartphone className="w-3.5 h-3.5" /> Depois você também pode entrar pelo app Ministério360.
                            </p>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">Ministério360</p>
            </div>
        </main>
    );
}

function Message({ title, text, showLogin }: { title: string; text: string; showLogin?: boolean }) {
    return (
        <div className="flex flex-col items-center text-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-gray-400" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
            {showLogin && (
                <a href="/login" className="text-sm font-semibold text-[#0F766E] hover:underline">
                    Ir para o login
                </a>
            )}
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    autoComplete,
    disabled,
    hint,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    autoComplete?: string;
    disabled?: boolean;
    hint?: string;
}) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                disabled={disabled}
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#38B2AC] disabled:text-gray-500"
            />
            {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
        </label>
    );
}
