"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Loader2 } from "lucide-react";

// Redirecionamento inteligente
const redirectUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/reset-password/update"
    : "https://ministerio360.vercel.app/reset-password/update";

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
        <div className="flex min-h-screen items-center justify-center px-6 bg-gray-100">
            <div className="bg-white p-10 rounded-2xl shadow-md max-w-xl w-full">
                {!sent ? (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                            Recuperar senha
                        </h2>

                        <label className="block font-medium text-gray-700 mb-2">
                            Digite seu e-mail
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl mb-4"
                            required
                        />

                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="w-full bg-[#38B2AC] text-white py-3 rounded-xl flex justify-center"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-6 h-6" />
                            ) : (
                                "Enviar link"
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-emerald-600 mb-3">
                            E-mail enviado!
                        </h2>
                        <p className="text-gray-600">
                            Se o e-mail existir, você receberá um link para redefinir sua senha.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
