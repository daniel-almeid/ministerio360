"use client";

import { useEffect, useState } from "react";
import Loading from "../../../../components/shared/loading";
import {
    useSubscription,
    PLANS,
    type PlanSlug,
} from "./hook/useSubscription";
import CurrentPlanCard from "./components/currentPlanCard";
import BillingCycle from "./components/billingCycle";
import PlanComparison from "./components/planComparison";
import FooterActions from "./components/footerActions";
import CancelSubscriptionModal from "./components/modal/cancelSubscriptionModal";
import PaymentFormModal from "./components/modal/paymentFormModal";
import { supabase } from "@/lib/supabaseClient";

function getDefaultUpgradeTarget(current: PlanSlug): PlanSlug {
    if (current === "free") return "standard";
    if (current === "standard") return "premium";
    return "premium";
}

export default function AssinaturaPage() {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlanSlug, setSelectedPlanSlug] = useState<PlanSlug | null>(null);

    const {
        loading,
        planSlug,
        currentPlan,
        price,
        isActive,
        formattedLastPayment,
        formattedNextPayment,
        formattedExpiresOn,
        progressPercent,
        hasPaidPlan,
    } = useSubscription();

    // RETORNO DO CHECKOUT PAGAR.ME
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");

        if (status === "success") {
            finalizeCheckout();
        }
    }, []);

    async function finalizeCheckout() {
        const selected = localStorage.getItem("selected_plan");
        if (!selected) return;

        const session = await supabase.auth.getSession();
        const jwt = session.data.session?.access_token;

        await fetch("/api/planos/ativar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                plan_slug: selected,
            }),
        });

        localStorage.removeItem("selected_plan");
        window.location.href = "/planos/assinatura";
    }

    if (loading) return <Loading />;

    const upgradeTarget = getDefaultUpgradeTarget(planSlug);

    function openPaymentFor(slug: PlanSlug) {
        setSelectedPlanSlug(slug);
        setShowPaymentModal(true);
    }

    return (
        <>
            <div className="max-w-5xl mx-auto px-6 py-0.5 space-y-0.5">
                <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 md:p-10 space-y-8">
                    {/* Cabeçalho: plano atual */}
                    <CurrentPlanCard
                        currentPlan={currentPlan}
                        price={price}
                        planSlug={planSlug}
                        isActive={isActive}
                        formattedNextPayment={formattedNextPayment}
                        formattedExpiresOn={formattedExpiresOn}
                    />

                    {/* Ciclo de cobrança (barra de progresso + datas) */}
                    <BillingCycle
                        hasPaidPlan={hasPaidPlan}
                        formattedLastPayment={formattedLastPayment}
                        formattedNextPayment={formattedNextPayment}
                        progressPercent={progressPercent}
                    />


                    {/* Comparação de planos + botões Migrar alinhados */}
                    <PlanComparison
                        plans={PLANS}
                        currentSlug={planSlug}
                        onSelectPlan={(plan) => openPaymentFor(plan.slug)}
                    />

                    {/* Ações de rodapé (somente cancelar) */}
                    <FooterActions
                        hasPaidPlan={hasPaidPlan}
                        isActive={isActive}
                        onCancelClick={() => setShowCancelModal(true)}
                    />
                </div>
            </div>

            {/* Modal de cancelamento */}
            <CancelSubscriptionModal
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                formattedExpiresOn={formattedExpiresOn}
            />

            {/* Modal de confirmação antes de abrir o checkout */}
            <PaymentFormModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                planSlug={selectedPlanSlug}
            />
        </>
    );
}
