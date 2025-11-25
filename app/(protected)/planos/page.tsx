"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Loading from "@/components/shared/loading";
import PlanCard from "./components/planCard";

export default function PlanosPage() {
    const [planSlug, setPlanSlug] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlan();
    }, []);

    async function loadPlan() {
        // aguarda o usuário final carregar
        const { data: userData } = await supabase.auth.getUser();

        const slug =
            userData?.user?.app_metadata?.plan_slug
            ?? "free";

        setPlanSlug(slug);
        setLoading(false);
    }

    if (loading) {
        return <Loading />;
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
                    name="Grátis"
                    price="R$ 0/mês"
                    features={[
                        "Dashboard",
                        "Cadastro de membros",
                        "Cadastro financeiro",
                        "Relatórios simples",
                    ]}
                    active={planSlug === "free"}
                />

                <PlanCard
                    slug="standard"
                    name="Padrão"
                    price="R$ 49,90/mês"
                    features={[
                        "Dashboard",
                        "Cadastro de membros",
                        "Cadastro de visitantes",
                        "Acompanhamento de visitantes",
                        "Cadastro financeiro",
                        "Relatórios simples",
                    ]}
                    active={planSlug === "standard"}
                />

                <PlanCard
                    slug="premium"
                    name="Premium+"
                    price="R$ 89,90/mês"
                    features={[
                        "Dashboard",
                        "Cadastro de membros",
                        "Cadastro de visitantes",
                        "Acompanhamento de visitantes",
                        "Cadastro financeiro",
                        "Cadastro de ministérios",
                        "Cadastro de eventos",
                        "Cadastro de escalas",
                        "Relatórios",
                        "Suporte prioritário",
                    ]}
                    active={planSlug === "premium"}
                />
            </div>
        </div>
    );
}
