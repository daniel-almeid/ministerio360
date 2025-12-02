"use client";

import { useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
            setError("Erro ao atualizar senha.");
            setLoading(false);
            return;
        }

        setSuccess(true);

        setTimeout(() => {
            router.push("/login");
        }, 1800);
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-6 bg-gray-100">
            <div className="bg-white p-10 rounded-2xl shadow-md max-w-md w-full">

                {!success ? (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                            Definir nova senha
                        </h2>

                        <input
                            type="password"
                            placeholder="Nova senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl mb-4"
                            required
                        />

                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="w-full bg-[#38B2AC] text-white py-3 rounded-xl flex justify-center"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-6 h-6" />
                            ) : (
                                "Atualizar senha"
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-emerald-600 mb-3">
                            Senha atualizada!
                        </h2>
                        <p className="text-gray-600">
                            Você será redirecionado para o login...
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
