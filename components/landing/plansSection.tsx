"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLAY_STORE_URL } from "@/lib/site";
import {
    PLANS,
    YEARLY_BADGE,
    formatBRL,
    type BillingCycle,
    type PlanInfo,
} from "@/lib/plans";
import { PROMO, promoView } from "@/lib/promo";
import { usePromoActive } from "@/lib/usePromoOffer";

function Price({ plan, cycle, promo }: { plan: PlanInfo; cycle: BillingCycle; promo: boolean }) {
    if (promo && plan.monthlyCents > 0) {
        const offer = promoView(plan, cycle, formatBRL);
        return (
            <div className="mt-4">
                <span className="inline-block rounded-full bg-[#F4B942] px-2.5 py-0.5 text-xs font-semibold !text-[#13324F]">{offer.badge}</span>
                <p className="mt-2 text-sm text-[#5B6B7B] line-through">{offer.fullLabel}</p>
                <p>
                    <span className="text-4xl font-semibold tracking-tight text-[#13324F]">{offer.amount}</span>
                    <span className="ml-1 text-sm text-[#5B6B7B]">{offer.when}</span>
                </p>
                <p className="mt-1 text-sm text-[#5B6B7B]">{offer.note.split(". ")[1]}</p>
            </div>
        );
    }
    if (plan.monthlyCents === 0) {
        return (
            <p className="mt-4">
                <span className="text-4xl font-semibold tracking-tight text-[#13324F]">R$ 0</span>
                <span className="ml-1 text-sm text-[#5B6B7B]">para sempre</span>
            </p>
        );
    }
    if (cycle === "yearly") {
        return (
            <div className="mt-4">
                <p>
                    <span className="text-4xl font-semibold tracking-tight text-[#13324F]">
                        {formatBRL(Math.round(plan.yearlyCents / 12))}
                    </span>
                    <span className="ml-1 text-sm text-[#5B6B7B]">/mês</span>
                </p>
                <p className="mt-1 text-sm text-[#5B6B7B]">{formatBRL(plan.yearlyCents)} por ano, em até {plan.maxInstallments}x</p>
            </div>
        );
    }
    return (
        <p className="mt-4">
            <span className="text-4xl font-semibold tracking-tight text-[#13324F]">{formatBRL(plan.monthlyCents)}</span>
            <span className="ml-1 text-sm text-[#5B6B7B]">/mês</span>
        </p>
    );
}

// Planos com o mesmo preço e os mesmos recursos que o cadastro usa (lib/plans.ts)
export default function PlansSection() {
    const [cycle, setCycle] = useState<BillingCycle>("monthly");
    const promo = usePromoActive();

    return (
        <section id="planos" className="scroll-mt-20 bg-[#F3F8F7] py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-semibold tracking-tight text-[#13324F] sm:text-4xl">Planos para cada tamanho de igreja</h2>
                        <p className="mt-3 text-[#4A5A6A]">
                            {promo
                                ? `${PROMO.name} até ${PROMO.lastDayLabel}: ${PROMO.percent.yearly}% off no plano anual ou ${PROMO.percent.monthly}% off no 1º mês. Para igrejas que ainda não assinaram.`
                                : "Comece no Grátis e mude de plano quando precisar. Sem fidelidade no mensal."}
                        </p>
                    </div>

                    <div role="radiogroup" aria-label="Forma de pagamento" className="inline-flex self-start rounded-full border border-[#CFE3DF] bg-white p-1 md:self-auto">
                        {(["monthly", "yearly"] as const).map((c) => (
                            <button
                                key={c}
                                role="radio"
                                aria-checked={cycle === c}
                                onClick={() => setCycle(c)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] ${
                                    cycle === c ? "bg-[#13324F] text-white" : "text-[#4A5A6A] hover:text-[#13324F]"
                                }`}
                            >
                                {c === "monthly" ? "Mensal" : `Anual · ${YEARLY_BADGE}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {PLANS.map((plan) => (
                        <article
                            key={plan.slug}
                            className={`flex flex-col rounded-3xl p-6 ${
                                plan.highlight
                                    ? "bg-[#13324F] text-white ring-1 ring-[#13324F]"
                                    : "bg-white ring-1 ring-[#DCEBE8]"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h3 className={`text-lg font-semibold ${plan.highlight ? "text-white" : "text-[#13324F]"}`}>{plan.name}</h3>
                                {plan.highlight && (
                                    <span className="rounded-full bg-[#F4B942] px-2.5 py-0.5 text-xs font-semibold text-[#13324F]">
                                        Recomendado
                                    </span>
                                )}
                            </div>
                            <p className={`mt-1 text-sm ${plan.highlight ? "text-white/70" : "text-[#5B6B7B]"}`}>{plan.tagline}</p>

                            <div className={plan.highlight ? "[&_span]:!text-white [&_p]:!text-white/80" : ""}>
                                <Price plan={plan} cycle={cycle} promo={promo} />
                            </div>

                            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex gap-2.5">
                                        <Check
                                            aria-hidden="true"
                                            className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? "text-[#7FD6CE]" : "text-[#0F766E]"}`}
                                        />
                                        <span className={plan.highlight ? "text-white/90" : "text-[#33414F]"}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={`mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                    plan.highlight
                                        ? "bg-white text-[#13324F] hover:bg-[#E3F2EF] focus-visible:outline-white"
                                        : "bg-[#0F766E] text-white hover:bg-[#0B5E58] focus-visible:outline-[#0F766E]"
                                }`}
                            >
                                {plan.monthlyCents === 0 ? "Criar conta grátis" : `Assinar o ${plan.name}`}
                            </Link>
                        </article>
                    ))}
                </div>

                <p className="mt-6 text-sm text-[#5B6B7B]">
                    Preços pelo site, no cartão de crédito.
                    {PLAY_STORE_URL && " No aplicativo Android, a assinatura é feita pela Google Play e o valor aparece lá antes da compra."}
                </p>
            </div>
        </section>
    );
}
