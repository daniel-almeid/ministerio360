"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PlanCard from "./components/planCard";

export default function PlanosPage() {
    const [planSlug, setPlanSlug] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlan();
    }, []);

    async function loadPlan() {
        const { data } = await supabase.auth.getSession();
        const slug = data.session?.user?.app_metadata?.plan_slug || "free";
        setPlanSlug(slug);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-gray-600">
                Carregando...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-14 space-y-10">
            <h1 className="text-4xl font-bold text-gray-800 text-center">
                Escolha seu plano
            </h1>

            <p className="text-center text-gray-600 max-w-2xl mx-auto">
                Atualize seu plano para desbloquear mais funcionalidades no Ministério360.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <PlanCard
                    slug="free"
                    name="Free"
                    price="R$ 0/mês"
                    features={[
                        "Dashboard",
                        "Controle financeiro",
                        "Cadastro de membros",
                    ]}
                    active={planSlug === "free"}
                />

                <PlanCard
                    slug="standard"
                    name="Standard"
                    price="R$ 49,90/mês"
                    features={[
                        "Tudo do plano Free",
                        "Cadastro de visitantes",
                        "Follow-up",
                        "Relatórios",
                    ]}
                    active={planSlug === "standard"}
                />

                <PlanCard
                    slug="premium"
                    name="Premium"
                    price="R$ 89,90/mês"
                    features={[
                        "Tudo do Standard",
                        "Cadastro de Ministérios",
                        "Eventos e Escalas",
                        "Suporte prioritário",
                    ]}
                    active={planSlug === "premium"}
                />
            </div>
        </div>
    );
}
