"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RegisterHeader from "./registerHeader";
import RegisterPlanSelector from "./registerPlanSelector";
import RegisterPlanDetails from "./registerPlanDetails";
import RegisterBackdrop from "./registerBackDrop";
import ConsentCheckbox from "@/components/legal/consentCheckbox";
import { legalAcceptance } from "@/lib/legal";
import { cleanReferralCode, clearReferralCode, readReferralCode } from "@/lib/referral";
import PasswordInput from "@/components/shared/passwordInput";
import { authErrorMessage } from "@/lib/authErrors";

import type { BillingCycle, PlanSlug } from "@/lib/plans";

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
            clearReferralCode();
            onSuccess(plan, cycle, name, email.trim(), data.user?.id ?? "");
        } catch (err) {
            setError(authErrorMessage(err as { message?: string }, "Não foi possível criar a conta. Tente novamente."));
        } finally {
            setLoading(false);
        }
    }

    // Objeto para verificar os requisitos visualmente
    const pwdCheck = validatePassword(password);

    return (
        <>
            {loading && <RegisterBackdrop />}

            <form
                onSubmit={handleRegister}
                className={`w-full max-w-5xl p-12 md:p-20 space-y-12 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-300/50 shadow-xl transition-all ${
                    loading ? "opacity-60 pointer-events-none" : "opacity-100"
                }`}
            >
                <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Voltar ao login
                </button>

                <RegisterHeader />

                <div className="space-y-8">
                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">
                            Nome da igreja
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
                            placeholder="Exemplo: Igreja Vida Nova"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
                            placeholder="seuemail@exemplo.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="referral" className="block text-base font-semibold text-gray-700 mb-2">
                            Código de indicação <span className="font-normal text-gray-500">(opcional)</span>
                        </label>
                        <input
                            id="referral"
                            type="text"
                            value={referral}
                            onChange={(e) => setReferral(cleanReferralCode(e.target.value))}
                            className="w-full px-5 py-4 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-teal-500 uppercase tracking-widest"
                            placeholder="Ex.: K7M2QX"
                            autoComplete="off"
                            maxLength={12}
                        />
                        <p className="mt-2 text-sm text-gray-500">Se outra igreja indicou o Ministério360 para você, informe o código dela.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="relative">
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                                Senha
                            </label>
                            <PasswordInput
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
                                placeholder="Crie uma senha forte"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                                Confirmar senha
                            </label>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-5 py-4 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
                                placeholder="Repita sua senha"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                        <p className={pwdCheck.minLength ? "text-green-600" : "text-red-600"}>
                            • Mínimo de 8 caracteres
                        </p>
                        <p className={pwdCheck.hasUpper ? "text-green-600" : "text-red-600"}>
                            • Pelo menos 1 letra maiúscula
                        </p>
                        <p className={pwdCheck.hasLower ? "text-green-600" : "text-red-600"}>
                            • Pelo menos 1 letra minúscula
                        </p>
                        <p className={pwdCheck.hasNumber ? "text-green-600" : "text-red-600"}>
                            • Pelo menos 1 número
                        </p>
                        <p className={pwdCheck.hasSpecial ? "text-green-600" : "text-red-600"}>
                            • Pelo menos 1 caractere especial
                        </p>
                    </div>
                </div>

                <div className="h-px bg-gray-300 my-10"></div>

                <RegisterPlanSelector
                    plan={plan}
                    setPlan={setPlan}
                    cycle={cycle}
                    setCycle={setCycle}
                    setShowDetails={setShowDetails}
                />

                <ConsentCheckbox
                    checked={accepted}
                    invalid={consentMissing && !accepted}
                    onChange={(v) => {
                        setAccepted(v);
                        if (v) setConsentMissing(false);
                    }}
                />

                {error && <p className="text-base text-red-500 text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-white py-4 text-lg rounded-xl font-semibold bg-teal-500 hover:bg-teal-600 transition shadow-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-6 w-6" />
                            Criando...
                        </>
                    ) : (
                        "Criar conta"
                    )}
                </button>

                <p className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Ministério360
                </p>
            </form>

            <RegisterPlanDetails
                showDetails={showDetails}
                setShowDetails={setShowDetails}
            />
        </>
    );
}
