"use client";

import Loading from "@/components/shared/loading";
import { useSubscription, PLANS } from "./hook/useSubscription";
import CurrentPlanCard from "./components/currentPlanCard";
import BillingCycle from "./components/billingCycle";
import PaymentHistory from "./components/paymentHistory";
import PlanComparison from "./components/planComparison";
import FooterActions from "./components/footerActions";

export default function AssinaturaPage() {
    const {
        loading,
        planSlug,
        currentPlan,
        price,
        isActive,
        formattedLastPayment,
        formattedNextPayment,
        progressPercent,
        paymentHistory,
        hasPaidPlan,
        cancelSubscription,
    } = useSubscription();

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-0.5 space-y-0.5">
            <h1 className="text-4xl font-bold text-gray-900 text-center">
                Minha Assinatura
            </h1>

            <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 md:p-10 space-y-8">
                {currentPlan && (
                    <CurrentPlanCard
                        key={planSlug}
                        currentPlan={currentPlan}
                        price={price}
                        planSlug={planSlug}
                        isActive={isActive}
                        formattedNextPayment={formattedNextPayment}
                    />
                )}

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

                <FooterActions hasPaidPlan={hasPaidPlan} onCancel={cancelSubscription} />
            </div>
        </div>
    );
}
