"use client";

import { usePlan } from "./hook/usePlan";
import Loading from "@/components/shared/loading";
import PlanCard from "./components/planCard";
import PlanFooter from "./components/planFooter";

export default function PlanosPage() {
    const { loading, currentPlan, active } = usePlan();

    if (loading) return <Loading />;

    return (
        <div className="max-w-6xl mx-auto px-2 py-4 space-y-10">
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
                    current={currentPlan}
                    active={active && currentPlan === "free"}
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
                    current={currentPlan}
                    active={active && currentPlan === "standard"}
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
                    current={currentPlan}
                    active={active && currentPlan === "premium"}
                />
            </div>

            <PlanFooter />
        </div>
    );
}
