"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import PaymentCardModal, { CardFormValues } from "./paymentCardModal";
import { subscribeWithCard } from "../subscribe";
import { monthlyEquivalent, priceCents, priceLabel, type BillingCycle, type PlanInfo, type PlanSlug } from "@/lib/plans";

type Props = {
    plan: PlanInfo;
    cycle: BillingCycle;
    current: PlanSlug;
    active: boolean;
};

export default function PlanCard({ plan, cycle, current, active }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    const isSelected = current === plan.slug;
    const isActive = active && isSelected;
    const isFree = plan.monthlyCents === 0;

    async function confirmarAssinatura(values: CardFormValues) {
        await subscribeWithCard({ planSlug: plan.slug, cycle, values });
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
                    <p className="text-3xl font-extrabold text-gray-800 mt-3">{priceLabel(plan, cycle)}</p>
                    <p className="text-sm text-emerald-700 font-medium h-5 mt-0.5">
                        {!isFree && cycle === "yearly" ? monthlyEquivalent(plan) : ""}
                    </p>

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
                price={priceLabel(plan, cycle)}
                totalCents={priceCents(plan, cycle)}
                maxInstallments={cycle === "yearly" ? plan.maxInstallments : 1}
                onClose={() => setModalOpen(false)}
                onSubmit={confirmarAssinatura}
            />
        </>
    );
}
