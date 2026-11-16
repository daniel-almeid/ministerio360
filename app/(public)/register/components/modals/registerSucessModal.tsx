"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, MailCheck } from "lucide-react";
import Loading from "@/components/shared/loading";
import PaymentCardModal, { CardFormValues } from "@/app/(protected)/planos/components/paymentCardModal";
import { subscribeWithCard } from "@/app/(protected)/planos/subscribe";
import { PLAN_NAME, formatBRL, getPlan, priceCents, priceLabel, type BillingCycle, type PlanSlug } from "@/lib/plans";
import { promoActive, promoView } from "@/lib/promo";

type Props = {
    open: boolean;
    onClose: () => void;
    planSlug: PlanSlug;
    cycle: BillingCycle;
    name: string;
    email: string;
    userId: string;
};

export default function RegisterSuccessModal({
    open,
    onClose,
    planSlug,
    cycle,
    name,
    email,
    userId,
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
    // Conta nova: na Black Friday a primeira cobrança sai com desconto
    const offer = isPaidPlan && promoActive() ? promoView(plan, cycle, formatBRL) : null;

    async function confirmarAssinatura(values: CardFormValues) {
        await subscribeWithCard({ planSlug, cycle, values, email, name, userId, promo: !!offer });
        setShowCardModal(false);
        setPaidSuccessfully(true);
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 space-y-5">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F7F5] text-[#0F766E]">
                    <CheckCircle2 className="h-10 w-10" />
                </div>

                <h2 className="text-2xl font-extrabold text-center text-[#1E3A5F]">
                    Cadastro realizado com sucesso
                </h2>

                <div className="flex items-start gap-2.5 rounded-[14px] bg-[#F5F9F8] p-3.5 text-[14px] text-gray-700">
                    <MailCheck className="h-5 w-5 shrink-0 text-[#0F766E]" />
                    <p>Antes de continuar, acesse o seu e-mail e confirme sua conta para poder entrar no sistema.</p>
                </div>

                {paidSuccessfully ? (
                    <p className="flex items-start gap-2.5 rounded-[14px] bg-emerald-50 p-3.5 text-[14px] font-medium text-emerald-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        Assinatura confirmada! Assim que você confirmar o e-mail e fizer login, o
                        plano {PLAN_NAME[planSlug]} já estará ativo.
                    </p>
                ) : isPaidPlan ? (
                    <p className="flex items-start gap-2.5 rounded-[14px] bg-[#F5F9F8] p-3.5 text-[14px] text-gray-700">
                        <CreditCard className="h-5 w-5 shrink-0 text-[#0F766E]" />
                        Após confirmar, finalize o pagamento para liberar todas as funcionalidades do plano.
                    </p>
                ) : (
                    <p className="text-center text-[14px] text-gray-600">
                        Após confirmar, você já poderá acessar normalmente.
                    </p>
                )}

                <div className="flex flex-col gap-3 pt-1">
                    {isPaidPlan && !paidSuccessfully && (
                        <button
                            onClick={() => setShowCardModal(true)}
                            className="w-full min-h-[50px] bg-[#0F766E] text-white rounded-[14px] font-bold hover:bg-[#0D5C56] transition"
                        >
                            Pagar plano
                        </button>
                    )}

                    <button
                        onClick={handleClose}
                        className="w-full min-h-[50px] border-[1.5px] border-[#CFE6E2] text-[#0F766E] rounded-[14px] font-bold hover:bg-[#F5FBFA] transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            <PaymentCardModal
                open={showCardModal}
                planName={`${plan.name} ${cycle === "yearly" ? "Anual" : "Mensal"}`}
                price={offer ? offer.label : priceLabel(plan, cycle)}
                totalCents={offer ? offer.cents : priceCents(plan, cycle)}
                maxInstallments={cycle === "yearly" ? plan.maxInstallments : 1}
                onClose={() => setShowCardModal(false)}
                onSubmit={confirmarAssinatura}
            />
        </div>
    );
}
