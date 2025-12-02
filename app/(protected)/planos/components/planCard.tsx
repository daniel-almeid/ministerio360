"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlanSlug } from "../types";

type Props = {
    slug: PlanSlug;
    name: string;
    price: string;
    features: string[];
    current: PlanSlug;
    active: boolean;
};

const PLAN_PRICES: Record<PlanSlug, number> = {
    free: 0,
    standard: 4990,
    premium: 8990,
};

export default function PlanCard({
    slug,
    name,
    price,
    features,
    current,
    active,
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const isSelected = current === slug;
    const isActive = active && isSelected;

    async function pagar() {
        if (loading) return;
        setLoading(true);

        try {
            localStorage.setItem("selected_plan", slug);

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

            const price_cents = PLAN_PRICES[slug];

            const res = await fetch("/api/pagarme/create-checkout-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    plan_slug: slug,
                    email: user.email,
                    name,
                    price_cents,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success || !data?.checkout_url) {
                alert("Erro ao criar pedido de checkout.");
                setLoading(false);
                return;
            }

            window.location.href = data.checkout_url;
        } catch (err) {
            console.error("Erro:", err);
            alert("Erro ao processar pagamento.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className={`border rounded-2xl p-8 shadow-md flex flex-col justify-between
                ${isActive ? "border-teal-600 bg-teal-50" : isSelected ? "border-teal-600 bg-teal-100" : "border-gray-300 bg-white"}`}
        >
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
                <p className="text-3xl font-extrabold text-gray-800 mt-2">{price}</p>

                <ul className="mt-6 space-y-3">
                    {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-gray-700">
                            <span className="text-teal-600 font-bold text-lg">•</span>
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {isActive ? (
                <button
                    disabled
                    className="mt-8 py-3 px-4 rounded-xl font-semibold text-white bg-gray-400 cursor-not-allowed"
                >
                    Plano atual
                </button>
            ) : isSelected ? (
                <>
                    <button
                        disabled
                        className="mt-8 py-3 px-4 rounded-xl font-semibold text-gray-700  bg-gray-300 cursor-not-allowed"
                    >
                        Plano selecionado
                    </button>

                    <button
                        onClick={pagar}
                        disabled={loading}
                        className="mt-3 py-3 px-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60"
                    >
                        {loading ? "Redirecionando..." : "Pagar plano"}
                    </button>
                </>
            ) : (
                <button
                    onClick={pagar}
                    disabled={loading}
                    className="mt-8 py-3 px-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60"
                >
                    {loading ? "Processando..." : "Assinar"}
                </button>
            )}
        </div>
    );
}
