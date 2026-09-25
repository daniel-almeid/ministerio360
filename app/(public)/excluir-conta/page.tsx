"use client";

import { useState } from "react";
import Link from "next/link";

export default function ExcluirContaPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [step, setStep] = useState<"form" | "confirm" | "done">("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        setError("");

        if (confirmText.trim().toUpperCase() !== "EXCLUIR") {
            setError('Digite "EXCLUIR" para confirmar.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/account/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                setError(data?.error || "Erro ao excluir conta.");
                setLoading(false);
                return;
            }

            setStep("done");
        } catch {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    if (step === "done") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center space-y-4">
                    <h1 className="text-2xl font-bold text-emerald-600">Conta excluída</h1>
                    <p className="text-gray-600">
                        Sua conta e todos os dados associados (membros, visitantes, financeiro,
                        eventos, escalas e ministérios) foram removidos permanentemente do
                        Ministério360.
                    </p>
                    <Link href="/login" className="inline-block text-teal-600 font-medium">
                        Voltar ao início
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow p-8 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Excluir conta e dados</h1>

                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                    Esta ação é <strong>permanente e irreversível</strong>. Todos os dados da sua
                    igreja — membros, visitantes, financeiro, eventos, escalas, ministérios — serão
                    apagados definitivamente. Se houver uma assinatura ativa, ela também será
                    cancelada.
                </div>

                {step === "form" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <button
                            onClick={() => {
                                if (!email || !password) {
                                    setError("Preencha e-mail e senha.");
                                    return;
                                }
                                setError("");
                                setStep("confirm");
                            }}
                            className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-medium hover:bg-gray-900"
                        >
                            Continuar
                        </button>
                    </>
                )}

                {step === "confirm" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Digite <strong>EXCLUIR</strong> para confirmar
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-60"
                        >
                            {loading ? "Excluindo..." : "Excluir permanentemente"}
                        </button>

                        <button
                            onClick={() => setStep("form")}
                            className="w-full text-gray-500 py-1 text-sm"
                        >
                            Voltar
                        </button>
                    </>
                )}

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
        </div>
    );
}