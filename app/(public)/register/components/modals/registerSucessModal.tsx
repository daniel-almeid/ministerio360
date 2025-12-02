"use client";

import { useState } from "react";
import Loading from "@/components/shared/loading";

type PlanSlug = "free" | "standard" | "premium";

type Props = {
    open: boolean;
    onClose: () => void;
    planSlug: PlanSlug;
    name: string;
    email: string;
};

const PLAN_PRICES: Record<PlanSlug, number> = {
    free: 0,
    standard: 4990,
    premium: 8990,
};

export default function RegisterSuccessModal({
    open,
    onClose,
    planSlug,
    name,
    email,
}: Props) {

    const [loading, setLoading] = useState(false);
    const [exitLoading, setExitLoading] = useState(false);

    // Loading ao fechar e ir para login
    function handleClose() {
        setExitLoading(true);
        setTimeout(() => {
            window.location.href = "/login";
        }, 800);
    }

    if (exitLoading) return <Loading />;
    if (!open) return null;

    const price_cents = PLAN_PRICES[planSlug];
    const isPaidPlan = planSlug !== "free";

    async function handlePay() {
        setLoading(true);

        try {
            const res = await fetch("/api/pagarme/create-checkout-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_slug: planSlug,
                    name,
                    email,
                    price_cents
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success || !data?.checkout_url) {
                alert("Erro ao criar pedido de checkout.");
                return;
            }

            window.location.href = data.checkout_url;

        } catch (err) {
            alert("Erro ao processar pagamento.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-center">
                    Cadastro realizado com sucesso
                </h2>

                <p className="text-center text-gray-600">
                    Antes de continuar, acesse o seu e-mail e confirme sua conta para poder entrar no sistema.
                </p>

                {isPaidPlan ? (
                    <p className="text-center text-gray-600">
                        Após confirmar, finalize o pagamento para liberar todas as funcionalidades do plano.
                    </p>
                ) : (
                    <p className="text-center text-gray-600">
                        Após confirmar, você já poderá acessar normalmente.
                    </p>
                )}

                <div className="flex flex-col gap-3 mt-4">
                    {isPaidPlan && (
                        <button
                            onClick={handlePay}
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                            {loading ? "Redirecionando..." : "Pagar plano"}
                        </button>
                    )}

                    <button
                        onClick={handleClose}
                        className="w-full border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
