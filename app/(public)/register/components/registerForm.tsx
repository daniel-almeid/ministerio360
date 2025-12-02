"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RegisterHeader from "./registerHeader";
import RegisterPlanSelector from "./registerPlanSelector";
import RegisterPlanDetails from "./registerPlanDetails";
import RegisterBackdrop from "./registerBackDrop";

type PlanSlug = "free" | "standard" | "premium";

type Props = {
    onSuccess: (planSlug: PlanSlug, name: string, email: string) => void;
};

export default function RegisterForm({ onSuccess }: Props) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [plan, setPlan] = useState<PlanSlug>("free");
    const [showDetails, setShowDetails] = useState<string | null>(null);

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

        setLoading(true);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/login`,
                data: {
                    church_name: name,
                    plan_slug: plan,
                },
            },
        });

        if (signUpError) {
            setError("Erro ao criar conta: " + signUpError.message);
            setLoading(false);
            return;
        }

        onSuccess(plan, name, email);
        setLoading(false);
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

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="relative">
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                                Senha
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-teal-500 pr-12"
                                placeholder="Crie uma senha forte"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-12 text-gray-600"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>

                        <div className="relative">
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                                Confirmar senha
                            </label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-5 py-4 text-lg border rounded-xl bg-white focus:ring-2 focus:ring-teal-500 pr-12"
                                placeholder="Repita sua senha"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-12 text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
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
                    setShowDetails={setShowDetails}
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
