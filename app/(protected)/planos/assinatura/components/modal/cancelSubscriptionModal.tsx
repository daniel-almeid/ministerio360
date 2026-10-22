"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
    open: boolean;
    onClose: () => void;
    onCanceled: () => void;
    planName: string;
    formattedExpiresOn: string | null;
};

// Cancela a renovação automática. O plano continua até o fim do período pago.
export default function CancelSubscriptionModal({ open, onClose, onCanceled, planName, formattedExpiresOn }: Props) {
    const [step, setStep] = useState<"confirm" | "done">("confirm");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    function close() {
        if (loading) return;
        if (step === "done") onCanceled();
        setStep("confirm");
        setError("");
        onClose();
    }

    async function cancelar() {
        setLoading(true);
        setError("");
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error("Sessão expirada. Faça login novamente.");

            const res = await fetch("/api/pagarme/cancel-subscription", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json?.success) throw new Error(json?.error || "Não foi possível cancelar agora.");
            setStep("done");
        } catch (err: any) {
            setError(err?.message || "Não foi possível cancelar agora.");
        } finally {
            setLoading(false);
        }
    }

    const ate = formattedExpiresOn ?? "o fim do período já pago";

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
                {step === "confirm" ? (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Cancelar a renovação?</h2>
                        </div>

                        <div className="text-gray-600 leading-relaxed space-y-2 text-sm">
                            <p>
                                A cobrança automática do plano <strong>{planName}</strong> será cancelada. Nada mais
                                será cobrado no seu cartão.
                            </p>
                            <p>
                                Você continua com todos os recursos do plano até <strong>{ate}</strong>. Depois
                                disso, a igreja passa para o plano Grátis — nenhum dado é apagado.
                            </p>
                            <p className="text-gray-500">
                                Valores já pagos não são devolvidos, exceto no arrependimento em até 7 dias da
                                contratação (peça pelo e-mail de suporte, conforme os Termos de Uso).
                            </p>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                            <button
                                onClick={close}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-60"
                            >
                                Manter assinatura
                            </button>
                            <button
                                onClick={cancelar}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? "Cancelando..." : "Cancelar renovação"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Renovação cancelada</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Pronto. Você não será mais cobrado e continua com o plano <strong>{planName}</strong> até{" "}
                            <strong>{ate}</strong>. Se mudar de ideia, é só assinar de novo.
                        </p>
                        <button
                            onClick={close}
                            className="w-full py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700"
                        >
                            Entendi
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
