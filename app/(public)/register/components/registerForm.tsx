"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Church, Loader2, Lock, Mail, Ticket, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RegisterPlanSelector from "./registerPlanSelector";
import RegisterPlanDetails from "./registerPlanDetails";
import RegisterBackdrop from "./registerBackDrop";
import ConsentCheckbox from "@/components/legal/consentCheckbox";
import { legalAcceptance } from "@/lib/legal";
import { cleanReferralCode, clearReferralCode, readReferralCode } from "@/lib/referral";
import PasswordInput from "@/components/shared/passwordInput";
import { authErrorMessage } from "@/lib/authErrors";
import { AuthError, AuthLabel, AuthLayout, AuthTitle, FieldBox, authInput, primaryButton } from "@/components/auth/authShell";

import type { BillingCycle, PlanSlug } from "@/lib/plans";
import { track } from "@/lib/analytics";

type Props = {
    onSuccess: (planSlug: PlanSlug, cycle: BillingCycle, name: string, email: string, userId: string) => void;
};

export default function RegisterForm({ onSuccess }: Props) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const [plan, setPlan] = useState<PlanSlug>("free");
    const [cycle, setCycle] = useState<BillingCycle>("monthly");
    const [showDetails, setShowDetails] = useState<string | null>(null);

    const [accepted, setAccepted] = useState(false);
    // Código de indicação: vem do link (?indicacao=) ou do que ficou guardado ao passar pela página inicial
    const [referral, setReferral] = useState("");
    useEffect(() => {
        const fromUrl = cleanReferralCode(new URLSearchParams(window.location.search).get("indicacao"));
        setReferral(fromUrl || readReferralCode());
    }, []);
    const [consentMissing, setConsentMissing] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Função de validação de senha forte
    function validatePassword(pwd: string) {
        const minLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

        return {
            valid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
            minLength,
            hasUpper,
            hasLower,
            hasNumber,
            hasSpecial,
        };
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!name || !email || !password) {
            setError("Preencha todos os campos obrigatórios.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        const pwdCheck = validatePassword(password);
        if (!pwdCheck.valid) {
            setError("A senha não atende aos requisitos de segurança.");
            return;
        }

        if (!accepted) {
            setConsentMissing(true);
            setError("Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.");
            return;
        }

        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        church_name: name,
                        plan_slug: plan,
                        ...legalAcceptance(),
                        ...(cleanReferralCode(referral) ? { referral_code: cleanReferralCode(referral) } : {}),
                    },
                },
            });

            if (signUpError) {
                setError(authErrorMessage(signUpError, "Não foi possível criar a conta. Tente novamente."));
                return;
            }

            // Com confirmação de e-mail ligada, e-mail repetido não dá erro:
            // o Supabase devolve um usuário sem identidade. Isso não pode virar sucesso.
            if (data.user && (data.user.identities?.length ?? 0) === 0) {
                setError(authErrorMessage({ code: "user_already_exists" }));
                return;
            }

            // O id da conta vai junto para o pagamento logo após o cadastro (só este navegador o tem)
            track("conta_criada", { plano_escolhido: plan, ciclo: cycle, com_indicacao: !!cleanReferralCode(referral) });
            clearReferralCode();
            // Ciclo escolhido: usado para abrir o pagamento certo depois do login
            try {
                localStorage.setItem("m360_ciclo_escolhido", cycle);
            } catch {}
            onSuccess(plan, cycle, name, email.trim(), data.user?.id ?? "");
        } catch (err) {
            setError(authErrorMessage(err as { message?: string }, "Não foi possível criar a conta. Tente novamente."));
        } finally {
            setLoading(false);
        }
    }

    // Objeto para verificar os requisitos visualmente
    const pwdCheck = validatePassword(password);

    const rules = [
        { ok: pwdCheck.minLength, label: "8 caracteres" },
        { ok: pwdCheck.hasUpper, label: "1 maiúscula" },
        { ok: pwdCheck.hasLower, label: "1 minúscula" },
        { ok: pwdCheck.hasNumber, label: "1 número" },
        { ok: pwdCheck.hasSpecial, label: "1 caractere especial" },
    ];

    return (
        <AuthLayout width="lg" backHref="/login">
            {loading && <RegisterBackdrop />}

            <form
                onSubmit={handleRegister}
                className={`space-y-5 transition-all ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}
            >
                <AuthTitle title="Criar conta da igreja" subtitle="Leva menos de um minuto. Você confirma o e-mail e já começa a usar." />

                <Section title="Sua igreja" />

                <div>
                    <AuthLabel htmlFor="church">Nome da igreja</AuthLabel>
                    <FieldBox icon={Church}>
                        <input
                            id="church"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={authInput}
                            placeholder="Exemplo: Igreja Vida Nova"
                            required
                        />
                    </FieldBox>
                </div>

                <Section title="Seu acesso" />

                <div>
                    <AuthLabel htmlFor="email">E-mail</AuthLabel>
                    <FieldBox icon={Mail}>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={authInput}
                            placeholder="seuemail@exemplo.com"
                            autoComplete="email"
                            required
                        />
                    </FieldBox>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <AuthLabel htmlFor="password">Senha</AuthLabel>
                        <FieldBox icon={Lock}>
                            <PasswordInput
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={authInput}
                                placeholder="Crie uma senha forte"
                                autoComplete="new-password"
                                required
                            />
                        </FieldBox>
                    </div>

                    <div>
                        <AuthLabel htmlFor="confirm">Confirmar senha</AuthLabel>
                        <FieldBox icon={Lock} invalid={!!confirmPassword && confirmPassword !== password}>
                            <PasswordInput
                                id="confirm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={authInput}
                                placeholder="Repita sua senha"
                                autoComplete="new-password"
                                required
                            />
                        </FieldBox>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2" aria-label="Requisitos da senha">
                    {rules.map((r) => (
                        <span
                            key={r.label}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                r.ok ? "bg-[#E6F7F5] text-[#0F766E]" : "bg-gray-100 text-gray-500"
                            }`}
                        >
                            {r.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {r.label}
                        </span>
                    ))}
                </div>

                <Section title="Plano" />

                <RegisterPlanSelector
                    plan={plan}
                    setPlan={setPlan}
                    cycle={cycle}
                    setCycle={setCycle}
                    setShowDetails={setShowDetails}
                />

                <div>
                    <AuthLabel htmlFor="referral">
                        Código de indicação <span className="font-normal text-gray-500">(opcional)</span>
                    </AuthLabel>
                    <FieldBox icon={Ticket}>
                        <input
                            id="referral"
                            type="text"
                            value={referral}
                            onChange={(e) => setReferral(cleanReferralCode(e.target.value))}
                            className={`${authInput} uppercase tracking-widest`}
                            placeholder="Ex.: K7M2QX"
                            autoComplete="off"
                            maxLength={12}
                        />
                    </FieldBox>
                    <p className="mt-1.5 text-[12.5px] text-gray-500">
                        Se outra igreja indicou o Ministério360 para você, informe o código dela.
                    </p>
                </div>

                <ConsentCheckbox
                    checked={accepted}
                    invalid={consentMissing && !accepted}
                    onChange={(v) => {
                        setAccepted(v);
                        if (v) setConsentMissing(false);
                    }}
                />

                <AuthError message={error} />

                <button type="submit" disabled={loading} className={primaryButton}>
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-6 w-6" />
                            Criando...
                        </>
                    ) : (
                        "Criar minha conta"
                    )}
                </button>

                <p className="text-center text-[14px] text-gray-500">
                    Já tem conta?{" "}
                    <button type="button" onClick={() => router.push("/login")} className="font-bold text-[#0F766E] hover:underline">
                        Voltar ao login
                    </button>
                </p>

                <p className="text-center text-[13px] text-gray-400">© {new Date().getFullYear()} Ministério360</p>
            </form>

            <RegisterPlanDetails
                showDetails={showDetails}
                setShowDetails={setShowDetails}
            />
        </AuthLayout>
    );
}

// Título de bloco dentro do formulário ("Sua igreja", "Seu acesso", "Plano")
function Section({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="text-[13px] font-bold text-[#0F766E]">{title}</span>
            <span className="h-px flex-1 bg-[#E3EEEC]" />
        </div>
    );
}
