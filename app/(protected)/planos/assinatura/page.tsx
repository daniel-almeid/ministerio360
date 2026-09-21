"use client";

import { useState } from "react";
import Loading from "../../../../components/shared/loading";
import {
    useSubscription,
    PLANS,
    type PlanSlug,
} from "./hook/useSubscription";
import { supabase } from "@/lib/supabaseClient";
import CurrentPlanCard from "./components/currentPlanCard";
import BillingCycle from "./components/billingCycle";
import PlanComparison from "./components/planComparison";
import FooterActions from "./components/footerActions";
import CancelSubscriptionModal from "./components/modal/cancelSubscriptionModal";
import PaymentCardModal, { CardFormValues } from "../components/paymentCardModal";

const PAGARME_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY!;

async function tokenizeCard(card: {
    number: string;
    holderName: string;
    expMonth: string;
    expYear: string;
    cvv: string;
}) {
    const res = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${PAGARME_PUBLIC_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "card",
            card: {
                number: card.number.replace(/\s/g, ""),
                holder_name: card.holderName,
                exp_month: card.expMonth,
                exp_year: card.expYear,
                cvv: card.cvv,
            },
        }),
    });

    const json = await res.json();

    if (!res.ok || !json?.id) {
        throw new Error(json?.message || "Cartão inválido. Verifique os dados e tente novamente.");
    }

    return json.id as string;
}

function formatPrice(value: number) {
    return value === 0
        ? "R$ 0/mês"
        : `R$ ${value.toFixed(2).replace(".", ",")}/mês`;
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

    if (loading) return <Loading />;

    function openPaymentFor(slug: PlanSlug) {
        setSelectedPlanSlug(slug);
        setShowPaymentModal(true);
    }

    async function confirmarAssinatura(values: CardFormValues) {
        if (!selectedPlanSlug) return;

        const session = await supabase.auth.getSession();
        const user = session.data.session?.user;

        if (!user?.email) {
            throw new Error("Sessão expirada. Faça login novamente.");
        }

        const name =
            user.user_metadata?.full_name || user.user_metadata?.name || "Usuário";

        const cardToken = await tokenizeCard({
            number: values.number,
            holderName: values.holderName,
            expMonth: values.expMonth,
            expYear: values.expYear,
            cvv: values.cvv,
        });

        const streetLine = `${values.street}, ${values.number_address}${
            values.complement ? " - " + values.complement : ""
        }`;

        const res = await fetch("/api/pagarme/create-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plan_slug: selectedPlanSlug,
                card_token: cardToken,
                email: user.email,
                name,
                document: values.document,
                phone: { area_code: values.areaCode, number: values.phoneNumber },
                address: {
                    line_1: streetLine,
                    zip_code: values.zipCode,
                    city: values.city,
                    state: values.state,
                },
            }),
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Erro ao criar assinatura.");
        }

        // Mesma correção aplicada no planCard.tsx: gera um token novo já
        // com o plano atualizado, sem precisar de logout.
        await supabase.auth.refreshSession();

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
                    />

                    <PlanComparison
                        plans={PLANS}
                        currentSlug={planSlug}
                        onSelectPlan={(plan) => openPaymentFor(plan.slug)}
                    />

                    <FooterActions
                        hasPaidPlan={hasPaidPlan}
                        isActive={isActive}
                        onCancelClick={() => setShowCancelModal(true)}
                    />
                </div>
            </div>

            <CancelSubscriptionModal
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                formattedExpiresOn={formattedExpiresOn}
            />

            {selectedPlan && (
                <PaymentCardModal
                    open={showPaymentModal}
                    planName={selectedPlan.name}
                    price={formatPrice(selectedPlan.price)}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={confirmarAssinatura}
                />
            )}
        </>
    );
}