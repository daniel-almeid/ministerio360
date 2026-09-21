"use client";

import { useState } from "react";
import Loading from "@/components/shared/loading";
import PaymentCardModal, { CardFormValues } from "@/app/(protected)/planos/components/paymentCardModal";

type PlanSlug = "free" | "standard" | "premium";

type Props = {
    open: boolean;
    onClose: () => void;
    planSlug: PlanSlug;
    name: string;
    email: string;
};

const PLAN_NAMES: Record<PlanSlug, string> = {
    free: "Grátis",
    standard: "Padrão",
    premium: "Premium+",
};

const PLAN_PRICES_LABEL: Record<PlanSlug, string> = {
    free: "R$ 0/mês",
    standard: "R$ 49,90/mês",
    premium: "R$ 89,90/mês",
};

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

export default function RegisterSuccessModal({
    open,
    onClose,
    planSlug,
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

    async function confirmarAssinatura(values: CardFormValues) {
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
                plan_slug: planSlug,
                card_token: cardToken,
                email,
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
                        plano {PLAN_NAMES[planSlug]} já estará ativo.
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
                planName={PLAN_NAMES[planSlug]}
                price={PLAN_PRICES_LABEL[planSlug]}
                onClose={() => setShowCardModal(false)}
                onSubmit={confirmarAssinatura}
            />
        </div>
    );
}