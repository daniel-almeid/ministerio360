"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import PaymentCardModal, { CardFormValues } from "./paymentCardModal";
import { subscribeWithCard } from "../subscribe";
import { formatBRL, monthlyEquivalent, priceCents, priceLabel, type BillingCycle, type PlanInfo, type PlanSlug } from "@/lib/plans";
import { promoView } from "@/lib/promo";

type Props = {
    plan: PlanInfo;
    cycle: BillingCycle;
    current: PlanSlug;
    active: boolean;
    // Igreja que paga pela loja do celular: os botões de assinar ficam desligados
    locked?: boolean;
    // Black Friday para esta igreja (preço da primeira cobrança com desconto)
    promo?: boolean;
};

export default function PlanCard({ plan, cycle, current, active, locked = false, promo = false }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    const isSelected = current === plan.slug;
    const isActive = active && isSelected;
    const isFree = plan.monthlyCents === 0;
    const offer = promo && !isFree && !locked && !(active && isSelected) ? promoView(plan, cycle, formatBRL) : null;

    async function confirmarAssinatura(values: CardFormValues) {
        await subscribeWithCard({ planSlug: plan.slug, cycle, values, promo: !!offer });
        setModalOpen(false);
        window.location.reload();
    }

    return (
        <>
            <div
                className={`relative border rounded-2xl p-6 shadow-md flex flex-col justify-between
                    ${isActive ? "border-teal-600 bg-teal-50" : isSelected ? "border-teal-600 bg-teal-100" : plan.highlight ? "border-teal-400 bg-white" : "border-gray-300 bg-white"}`}
            >
                {plan.highlight && !isSelected && (
                    <span className="absolute -top-3 left-6 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-teal-600 text-white">
                        Recomendado
                    </span>
                )}

                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.tagline}</p>
                    {offer ? (
                        <>
                            <span className="inline-block mt-3 rounded-full bg-[#13324F] px-2.5 py-0.5 text-xs font-bold text-[#F4B942]">
                                {offer.badge}
                            </span>
                            <p className="text-sm text-gray-500 line-through mt-2">{offer.fullLabel}</p>
                            <p>
                                <span className="text-3xl font-extrabold text-gray-800">{offer.amount}</span>
                                <span className="ml-1 text-sm font-semibold text-gray-500">{offer.when}</span>
                            </p>
                            <p className="text-sm text-emerald-700 font-medium mt-0.5">{offer.note}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-3xl font-extrabold text-gray-800 mt-3">{priceLabel(plan, cycle)}</p>
                            <p className="text-sm text-emerald-700 font-medium h-5 mt-0.5">
                                {!isFree && cycle === "yearly" ? monthlyEquivalent(plan) : ""}
                            </p>
                        </>
                    )}

                    <ul className="mt-5 space-y-2.5">
                        {plan.features.map((f, i) => (
                            <li key={f} className={`flex items-start gap-2 ${i === 0 ? "text-gray-900 font-semibold" : "text-gray-700"}`}>
                                <Check className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {isActive ? (
                    <button disabled className="mt-8 py-3 px-4 rounded-xl font-semibold text-white bg-gray-400 cursor-not-allowed">
                        Plano atual
                    </button>
                ) : locked && !isFree ? (
                    <button disabled className="mt-8 py-3 px-4 rounded-xl font-semibold text-gray-500 bg-gray-100 cursor-not-allowed">
                        Pela Google Play
                    </button>
                ) : isFree ? (
                    <button disabled className="mt-8 py-3 px-4 rounded-xl font-semibold text-gray-500 bg-gray-100 cursor-default">
                        Gratuito
                    </button>
                ) : (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="mt-8 py-3 px-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700"
                    >
                        Assinar
                    </button>
                )}
            </div>

            <PaymentCardModal
                open={modalOpen}
                planName={`${plan.name} ${cycle === "yearly" ? "Anual" : "Mensal"}`}
                price={offer ? offer.label : priceLabel(plan, cycle)}
                totalCents={offer ? offer.cents : priceCents(plan, cycle)}
                maxInstallments={cycle === "yearly" ? plan.maxInstallments : 1}
                onClose={() => setModalOpen(false)}
                onSubmit={confirmarAssinatura}
            />
        </>
    );
}
