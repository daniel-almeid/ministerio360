"use client";

import { useState } from "react";
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
import PaymentCardModal, { CardFormValues } from "../components/paymentCardModal";
import CycleToggle from "../components/cycleToggle";
import { subscribeWithCard } from "../subscribe";
import { priceCents, priceLabel, type BillingCycle as Cycle } from "@/lib/plans";

export default function AssinaturaPage() {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlanSlug, setSelectedPlanSlug] = useState<PlanSlug | null>(null);
    const [cycle, setCycle] = useState<Cycle>("monthly");

    const {
        loading,
        planSlug,
        currentPlan,
        price,
        billingCycle,
        isActive,
        formattedLastPayment,
        formattedNextPayment,
        formattedExpiresOn,
        progressPercent,
        hasPaidPlan,
        hasAutoRenewal,
        renewalCanceled,
        reload,
    } = useSubscription();

    if (loading) return <Loading />;

    function openPaymentFor(slug: PlanSlug) {
        setSelectedPlanSlug(slug);
        setShowPaymentModal(true);
    }

    async function confirmarAssinatura(values: CardFormValues) {
        if (!selectedPlanSlug) return;
        await subscribeWithCard({ planSlug: selectedPlanSlug, cycle, values });
        setShowPaymentModal(false);
        window.location.reload();
    }

    const selectedPlan = PLANS.find((p) => p.slug === selectedPlanSlug);

    return (
        <>
            <div className="max-w-5xl mx-auto px-6 py-0.5 space-y-0.5">
                <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 md:p-10 space-y-8">
                    <CurrentPlanCard
                        currentPlan={currentPlan}
                        price={price}
                        billingCycle={billingCycle}
                        planSlug={planSlug}
                        isActive={isActive}
                        formattedNextPayment={formattedNextPayment}
                        formattedExpiresOn={formattedExpiresOn}
                    />

                    <BillingCycle
                        hasPaidPlan={hasPaidPlan}
                        formattedLastPayment={formattedLastPayment}
                        formattedNextPayment={formattedNextPayment}
                        progressPercent={progressPercent}
                        renewalCanceled={renewalCanceled}
                    />

                    <CycleToggle value={cycle} onChange={setCycle} />

                    <PlanComparison
                        plans={PLANS}
                        cycle={cycle}
                        currentSlug={planSlug}
                        currentCycle={billingCycle}
                        onSelectPlan={(plan) => openPaymentFor(plan.slug)}
                    />

                    <FooterActions
                        hasPaidPlan={hasPaidPlan}
                        hasAutoRenewal={hasAutoRenewal}
                        renewalCanceled={renewalCanceled}
                        formattedExpiresOn={formattedExpiresOn}
                        onCancelClick={() => setShowCancelModal(true)}
                    />
                </div>
            </div>

            <CancelSubscriptionModal
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onCanceled={reload}
                planName={currentPlan.name}
                formattedExpiresOn={formattedExpiresOn}
            />

            {selectedPlan && (
                <PaymentCardModal
                    open={showPaymentModal}
                    planName={`${selectedPlan.name} ${cycle === "yearly" ? "Anual" : "Mensal"}`}
                    price={priceLabel(selectedPlan, cycle)}
                    totalCents={priceCents(selectedPlan, cycle)}
                    maxInstallments={cycle === "yearly" ? selectedPlan.maxInstallments : 1}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={confirmarAssinatura}
                />
            )}
        </>
    );
}
