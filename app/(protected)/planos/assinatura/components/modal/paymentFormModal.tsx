"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { PlanSlug } from "../../hook/useSubscription";

type Props = {
    open: boolean;
    onClose: () => void;
    planSlug: PlanSlug | null;
};

// Preços oficiais em centavos
const PLAN_PRICES: Record<PlanSlug, number> = {
    free: 0,
    standard: 4990,
    premium: 8990,
};

export default function PaymentFormModal({ open, onClose, planSlug }: Props) {
    const [loading, setLoading] = useState(false);

    if (!open || !planSlug) return null;

    const price_cents = PLAN_PRICES[planSlug];

    async function handlePay() {
        setLoading(true);

        try {
            // salva plano para ativação posterior
            if (planSlug) {
                localStorage.setItem("selected_plan", planSlug);
            }

            const session = await supabase.auth.getSession();
            const jwt = session.data.session?.access_token;
            const user = session.data.session?.user;

            if (!jwt || !user?.email) {
                alert("Sessão expirada. Faça login novamente.");
                setLoading(false);
                return;
            }

            const name =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "Usuário";

            console.log("📤 ENVIANDO PARA API:", {
                plan_slug: planSlug,
                email: user.email,
                name,
                price_cents,
            });

            const res = await fetch("/api/pagarme/create-checkout-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    plan_slug: planSlug,
                    email: user.email,
                    name,
                    price_cents,
                }),
            });

            const data = await res.json();

            console.log("📥 RESPOSTA DO SERVIDOR:", data);

            if (!res.ok || !data?.success || !data?.checkout_url) {
                alert("Erro ao criar pedido de checkout.");
                return;
            }

            window.location.href = data.checkout_url;

        } catch (err) {
            console.error("❌ Erro ao processar:", err);
            alert("Erro ao processar pagamento.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
                <h2 className="text-lg font-semibold">Concluir pagamento</h2>

                <p className="text-gray-600">
                    Você será redirecionado ao ambiente seguro do Pagar.me para concluir o pagamento.
                </p>

                <button
                    disabled={loading}
                    onClick={handlePay}
                    className="w-full py-3 bg-teal-600 text-white rounded-xl disabled:opacity-60"
                >
                    {loading ? "Redirecionando..." : "Pagar agora"}
                </button>

                <button
                    disabled={loading}
                    onClick={onClose}
                    className="w-full mt-2 py-3 bg-gray-200 rounded-xl"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
