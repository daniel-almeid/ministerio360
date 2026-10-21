"use client";

import { useState } from "react";
import Loading from "@/components/shared/loading";
import PaymentCardModal, { CardFormValues } from "@/app/(protected)/planos/components/paymentCardModal";
import { subscribeWithCard } from "@/app/(protected)/planos/subscribe";
import { PLAN_NAME, getPlan, priceCents, priceLabel, type BillingCycle, type PlanSlug } from "@/lib/plans";

type Props = {
    open: boolean;
    onClose: () => void;
    planSlug: PlanSlug;
    cycle: BillingCycle;
    name: string;
    email: string;
};

export default function RegisterSuccessModal({
    open,
    onClose,
    planSlug,
    cycle,
    name,
    email,
}: Props) {
    const [exitLoading, setExitLoading] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [paidSuccessfully, setPaidSuccessfully] = useState(false);

    function handleClose() {
        setExitLoading(true);
        setTimeout(() => {
            window.location.href = "/login";
        }, 800);
    }

    if (exitLoading) return <Loading />;
    if (!open) return null;

    const isPaidPlan = planSlug !== "free";

    const plan = getPlan(planSlug);

    async function confirmarAssinatura(values: CardFormValues) {
        await subscribeWithCard({ planSlug, cycle, values, email, name });
        setShowCardModal(false);
        setPaidSuccessfully(true);
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-center">
                    Cadastro realizado com sucesso
                </h2>

                <p className="text-center text-gray-600">
                    Antes de continuar, acesse o seu e-mail e confirme sua conta para poder entrar no sistema.
                </p>

                {paidSuccessfully ? (
                    <p className="text-center text-emerald-600 font-medium">
                        Assinatura confirmada! Assim que você confirmar o e-mail e fizer login, o
                        plano {PLAN_NAME[planSlug]} já estará ativo.
                    </p>
                ) : isPaidPlan ? (
                    <p className="text-center text-gray-600">
                        Após confirmar, finalize o pagamento para liberar todas as funcionalidades do plano.
                    </p>
                ) : (
                    <p className="text-center text-gray-600">
                        Após confirmar, você já poderá acessar normalmente.
                    </p>
                )}

                <div className="flex flex-col gap-3 mt-4">
                    {isPaidPlan && !paidSuccessfully && (
                        <button
                            onClick={() => setShowCardModal(true)}
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
                        >
                            Pagar plano
                        </button>
                    )}

                    <button
                        onClick={handleClose}
                        className="w-full border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            <PaymentCardModal
                open={showCardModal}
                planName={`${plan.name} ${cycle === "yearly" ? "Anual" : "Mensal"}`}
                price={priceLabel(plan, cycle)}
                totalCents={priceCents(plan, cycle)}
                maxInstallments={cycle === "yearly" ? plan.maxInstallments : 1}
                onClose={() => setShowCardModal(false)}
                onSubmit={confirmarAssinatura}
            />
        </div>
    );
}