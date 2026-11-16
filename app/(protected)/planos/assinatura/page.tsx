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
import { formatBRL, priceCents, priceLabel, type BillingCycle as Cycle } from "@/lib/plans";
import { promoView } from "@/lib/promo";
import { usePromoOffer } from "@/lib/usePromoOffer";

export default function AssinaturaPage() {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlanSlug, setSelectedPlanSlug] = useState<PlanSlug | null>(null);
    const [cycle, setCycle] = useState<Cycle>("monthly");
    const promo = usePromoOffer();

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
        isBonus,
        reload,
    } = useSubscription();

    if (loading) return <Loading />;

    function openPaymentFor(slug: PlanSlug) {
        setSelectedPlanSlug(slug);
        setShowPaymentModal(true);
    }

    async function confirmarAssinatura(values: CardFormValues) {
        if (!selectedPlanSlug) return;
        await subscribeWithCard({ planSlug: selectedPlanSlug, cycle, values, promo: !!offer });
        setShowPaymentModal(false);
        window.location.reload();
    }

    const selectedPlan = PLANS.find((p) => p.slug === selectedPlanSlug);
    const offer = promo && selectedPlan && selectedPlan.monthlyCents > 0 ? promoView(selectedPlan, cycle, formatBRL) : null;

    return (
        <>
            <div className="max-w-5xl mx-auto md:px-6 py-0.5 space-y-0.5">
                <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-5 sm:p-8 md:p-10 space-y-8">
                    <CurrentPlanCard
                        currentPlan={currentPlan}
                        price={price}
                        billingCycle={billingCycle}
                        planSlug={planSlug}
                        isActive={isActive}
                        formattedNextPayment={formattedNextPayment}
                        formattedExpiresOn={formattedExpiresOn}
                        isBonus={isBonus}
                    />

                    <BillingCycle
                        hasPaidPlan={hasPaidPlan && !isBonus}
                        formattedLastPayment={formattedLastPayment}
                        formattedNextPayment={formattedNextPayment}
                        progressPercent={progressPercent}
                        renewalCanceled={renewalCanceled}
                    />

                    <CycleToggle value={cycle} onChange={setCycle} />

                    <PlanComparison
                        plans={PLANS}
                        cycle={cycle}
                        currentSlug={isBonus ? "free" : planSlug} // no mês grátis, todos os planos podem ser assinados
                        currentCycle={billingCycle}
                        promo={promo}
                        onSelectPlan={(plan) => openPaymentFor(plan.slug)}
                    />

                    <FooterActions
                        hasPaidPlan={hasPaidPlan && !isBonus}
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
                planSlug={planSlug}
                billingCycle={billingCycle}
                formattedExpiresOn={formattedExpiresOn}
            />

            {selectedPlan && (
                <PaymentCardModal
                    open={showPaymentModal}
                    planName={`${selectedPlan.name} ${cycle === "yearly" ? "Anual" : "Mensal"}`}
                    price={offer ? offer.label : priceLabel(selectedPlan, cycle)}
                    totalCents={offer ? offer.cents : priceCents(selectedPlan, cycle)}
                    maxInstallments={cycle === "yearly" ? selectedPlan.maxInstallments : 1}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={confirmarAssinatura}
                />
            )}
        </>
    );
}
