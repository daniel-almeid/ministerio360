"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "user_only" | "transfer" | "delete_church";
type Preview = {
    mode: Mode;
    church_name: string | null;
    successor_name: string | null;
    other_users: number;
    has_subscription: boolean;
};

function plural(n: number, um: string, varios: string) {
    return n === 1 ? um : varios;
}

// O que vai acontecer, em palavras (mostrado antes de confirmar)
function Explicacao({ p }: { p: Preview }) {
    const igreja = p.church_name ? <strong>{p.church_name}</strong> : "sua igreja";

    if (p.mode === "user_only") {
        return (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 space-y-1">
                <p>Somente a <strong>sua conta de acesso</strong> será excluída.</p>
                <p>A igreja {igreja} e todos os dados dela continuam para os outros usuários.</p>
            </div>
        );
    }

    if (p.mode === "transfer") {
        return (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 space-y-1">
                <p>Você é o titular da igreja {igreja}.</p>
                <p>
                    A igreja e todos os dados <strong>continuam</strong>, e a titularidade passa para{" "}
                    <strong>{p.successor_name ?? "o outro Pastor"}</strong>, que também é Pastor.
                    {p.has_subscription && " A assinatura continua ativa."}
                </p>
                <p>Somente a <strong>sua conta de acesso</strong> será excluída.</p>
            </div>
        );
    }

    return (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 space-y-1">
            <p>Você é o único Pastor da igreja {igreja}.</p>
            <p>
                A igreja e <strong>todos os dados</strong> (membros, visitantes, financeiro, eventos, escalas e
                ministérios) serão apagados <strong>definitivamente</strong>.
            </p>
            {p.has_subscription && <p>A assinatura será cancelada.</p>}
            {p.other_users > 0 && (
                <p>
                    {plural(
                        p.other_users,
                        "O outro usuário da igreja também perderá o acesso (a conta dele será excluída).",
                        `Os outros ${p.other_users} usuários da igreja também perderão o acesso (as contas serão excluídas).`
                    )}
                </p>
            )}
        </div>
    );
}

const DONE_TEXT: Record<Mode, string> = {
    user_only: "Sua conta de acesso foi excluída. A igreja continua para os outros usuários.",
    transfer: "Sua conta de acesso foi excluída e a igreja foi transferida para o outro Pastor.",
    delete_church:
        "Sua conta e todos os dados da igreja (membros, visitantes, financeiro, eventos, escalas e ministérios) foram removidos permanentemente do Ministério360.",
};

export default function ExcluirContaPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [step, setStep] = useState<"form" | "confirm" | "done">("form");
    const [preview, setPreview] = useState<Preview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function send(body: Record<string, unknown>) {
        const res = await fetch("/api/account/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, ...body }),
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    }

    // Passo 1: confere e-mail e senha e mostra o que vai acontecer
    async function handleContinue() {
        if (!email || !password) {
            setError("Preencha e-mail e senha.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const { ok, data } = await send({});
            if (!ok || !data?.preview) {
                setError(data?.error || "Não foi possível conferir a conta.");
                return;
            }
            setPreview(data.preview);
            setConfirmText("");
            setStep("confirm");
        } catch {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    // Passo 2: exclui de verdade
    async function handleDelete() {
        setError("");
        if (confirmText.trim().toUpperCase() !== "EXCLUIR") {
            setError('Digite "EXCLUIR" para confirmar.');
            return;
        }
        if (!preview) return;

        setLoading(true);
        try {
            const { ok, status, data } = await send({ confirm: true, mode: preview.mode });
            if (!ok || !data?.success) {
                if (status === 409 && data?.preview) setPreview(data.preview); // mostra a situação nova
                setError(data?.error || "Erro ao excluir conta.");
                return;
            }
            setStep("done");
        } catch {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    if (step === "done" && preview) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center space-y-4">
                    <h1 className="text-2xl font-bold text-emerald-600">Conta excluída</h1>
                    <p className="text-gray-600">{DONE_TEXT[preview.mode]}</p>
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

                {step === "form" && (
                    <>
                        <p className="text-sm text-gray-600">
                            Entre com o e-mail e a senha da conta. Antes de excluir, mostramos exatamente o que vai
                            acontecer com a sua igreja.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <button
                            onClick={handleContinue}
                            disabled={loading}
                            className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-60"
                        >
                            {loading ? "Conferindo..." : "Continuar"}
                        </button>
                    </>
                )}

                {step === "confirm" && preview && (
                    <>
                        <Explicacao p={preview} />

                        <p className="text-sm text-gray-600">
                            Esta ação é <strong>permanente</strong> e não pode ser desfeita.
                        </p>

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
                            onClick={() => {
                                setStep("form");
                                setError("");
                            }}
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
