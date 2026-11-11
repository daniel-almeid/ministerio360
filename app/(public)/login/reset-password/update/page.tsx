"use client";

import { useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { AuthError, AuthLabel, AuthLayout, AuthTitle, FieldBox, authInput, primaryButton } from "../../../../../components/auth/authShell";
import PasswordInput from "../../../../../components/shared/passwordInput";
import { authErrorMessage } from "../../../../../lib/authErrors";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleUpdate() {
        setError("");

        if (!strongPasswordRegex.test(password)) {
            setError(
                "A senha deve conter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial."
            );
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(authErrorMessage(error, "Não foi possível atualizar a senha. Peça um novo link e tente de novo."));
            setLoading(false);
            return;
        }

        setSuccess(true);

        setTimeout(() => {
            router.push("/login");
        }, 1800);
    }

    return (
        <AuthLayout>
            {!success ? (
                <div className="space-y-5">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F7F5] text-[#0F766E]">
                        <Lock className="h-7 w-7" />
                    </span>

                    <AuthTitle
                        title="Definir nova senha"
                        subtitle="Use no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial."
                    />

                    <div>
                        <AuthLabel htmlFor="password">Nova senha</AuthLabel>
                        <FieldBox icon={Lock}>
                            <PasswordInput
                                id="password"
                                placeholder="Nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                className={authInput}
                                required
                            />
                        </FieldBox>
                    </div>

                    <AuthError message={error} />

                    <button onClick={handleUpdate} disabled={loading} className={primaryButton}>
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Atualizar senha"}
                    </button>
                </div>
            ) : (
                <div className="space-y-4 text-center">
                    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F7F5] text-[#0F766E]">
                        <CheckCircle2 className="h-10 w-10" />
                    </span>
                    <h1 className="text-[26px] font-extrabold text-[#1E3A5F]">Senha atualizada!</h1>
                    <p className="text-[15px] text-gray-600">Você será redirecionado para o login...</p>
                </div>
            )}
        </AuthLayout>
    );
}
