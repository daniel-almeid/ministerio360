"use client";

import Loading from "../../../../components/shared/loading";
import { useSubscription, PLANS } from "./hook/useSubscription";
import CurrentPlanCard from "./components/currentPlanCard";
import BillingCycle from "./components/billingCycle";
import PaymentHistory from "./components/paymentHistory";
import PlanComparison from "./components/planComparison";
import FooterActions from "./components/footerActions";
import CancelSubscriptionModal from "./components/modal/cancelSubscriptionModal";
import { useState } from "react";

export default function AssinaturaPage() {
    const [showCancelModal, setShowCancelModal] = useState(false);

    const {
        loading,
        planSlug,
        currentPlan,
        price,
        isActive,
        isCancelledButActive,
        formattedLastPayment,
        formattedNextPayment,
        formattedExpiresOn,
        progressPercent,
        paymentHistory,
        hasPaidPlan,
        cancelSubscription,
        cancelLoading,
    } = useSubscription();

    if (loading) {
        return <Loading />;
    }

    function handleConfirmCancel() {
        cancelSubscription().then(() => {
            setShowCancelModal(false);
        });
    }

    return (
        <>
            <div className="max-w-5xl mx-auto px-6 py-0.5 space-y-0.5">

                <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 md:p-10 space-y-8">
                    <CurrentPlanCard
                        currentPlan={currentPlan}
                        price={price}
                        planSlug={planSlug}
                        isActive={isActive}
                        isCancelledButActive={isCancelledButActive}
                        formattedNextPayment={formattedNextPayment}
                        formattedExpiresOn={formattedExpiresOn}
                    />

                    <BillingCycle
                        hasPaidPlan={hasPaidPlan}
                        formattedLastPayment={formattedLastPayment}
                        formattedNextPayment={formattedNextPayment}
                        progressPercent={progressPercent}
                    />

                    <PaymentHistory
                        hasPaidPlan={hasPaidPlan}
                        paymentHistory={paymentHistory}
                    />

                    <PlanComparison plans={PLANS} currentSlug={planSlug} />

                    <FooterActions
                        hasPaidPlan={hasPaidPlan}
                        isActive={isActive}
                        isCancelledButActive={isCancelledButActive}
                        onCancelClick={() => setShowCancelModal(true)}
                    />
                </div>
            </div>

            <CancelSubscriptionModal
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                loading={cancelLoading}
                formattedExpiresOn={formattedExpiresOn}
            />
        </>
    );
}
