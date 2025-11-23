"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function AssinaturaPage() {
    const [loading, setLoading] = useState(true);
    const [planSlug, setPlanSlug] = useState<string>("free");
    const [nextPayment, setNextPayment] = useState<string | null>(null);

    useEffect(() => {
        loadSubscriptionData();
    }, []);

    async function loadSubscriptionData() {
        const { data } = await supabase.auth.getSession();
        const slug = data.session?.user?.app_metadata?.plan_slug || "free";
        setPlanSlug(slug);

        const email = data.session?.user?.email;
        if (!email) return setLoading(false);

        // Busca assinatura ativa no Mercado Pago (só se for plano pago)
        if (slug !== "free") {
            const res = await fetch(`/api/subscription-info?email=${email}`);
            const info = await res.json();

            if (info.next_payment_date) {
                setNextPayment(info.next_payment_date);
            }
        }

        setLoading(false);
    }

    async function cancelSubscription() {
        if (!confirm("Tem certeza que deseja cancelar sua assinatura?")) return;

        const res = await fetch("/api/cancel", { method: "POST" });
        const data = await res.json();

        if (data.success) {
            alert("Assinatura cancelada com sucesso.");
            window.location.reload();
        } else {
            alert("Erro ao cancelar assinatura.");
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-gray-600">
                <Loader2 className="animate-spin w-6 h-6 mr-2" />
                Carregando informações…
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">

            <h1 className="text-4xl font-bold text-gray-800 text-center">
                Minha Assinatura
            </h1>

            <div className="border rounded-2xl p-8 bg-white shadow-md space-y-6">
                <p className="text-xl text-gray-700">
                    Plano atual:{" "}
                    <span className="font-bold text-teal-600 uppercase">
                        {planSlug}
                    </span>
                </p>

                {nextPayment && (
                    <p className="text-gray-700">
                        Próxima cobrança em:
                        <span className="font-semibold"> {nextPayment}</span>
                    </p>
                )}

                {planSlug !== "free" ? (
                    <>
                        <button
                            onClick={cancelSubscription}
                            className="w-full mt-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
                        >
                            Cancelar assinatura
                        </button>

                        <Link
                            href="/planos"
                            className="block w-full text-center py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition"
                        >
                            Alterar / Fazer upgrade de plano
                        </Link>
                    </>
                ) : (
                    <Link
                        href="/planos"
                        className="block w-full text-center py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition"
                    >
                        Contratar um plano
                    </Link>
                )}
            </div>
        </div>
    );
}
