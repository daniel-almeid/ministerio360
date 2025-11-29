"use client";

import { usePlan } from "./hook/usePlan";
import Loading from "@/components/shared/loading";
import PlanCard from "./components/planCard";

export default function PlanosPage() {
    const { loading, currentPlan, churchId, isCurrent } = usePlan();

    if (loading) return <Loading />;

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
                    active={isCurrent("free")}
                    churchId={churchId}
                    currentPlan={currentPlan}
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
                    active={isCurrent("standard")}
                    churchId={churchId}
                    currentPlan={currentPlan}
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
                    active={isCurrent("premium")}
                    churchId={churchId}
                    currentPlan={currentPlan}
                />
            </div>
        </div>
    );
}
