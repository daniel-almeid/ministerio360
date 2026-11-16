// =====================================================================
// Black Friday 2026: oferta do site (cartão, Pagar.me)
// - Anual: 30% de desconto na primeira cobrança do ano
// - Mensal: 50% de desconto no primeiro mês (depois volta ao preço normal)
// - De 16/11 a 30/11/2026 (horário de Brasília)
// - Só para igrejas que nunca pagaram um plano (contas novas e plano Grátis)
// O servidor (create-subscription) confere tudo de novo antes de cobrar.
// No app, o desconto é uma oferta da Google Play (ver o app: src/features/plans/promo.ts).
// =====================================================================

import type { BillingCycle, PlanInfo } from "./plans";

export const PROMO = {
    id: "black_friday_2026",
    name: "Black Friday",
    startsAt: "2026-11-16T00:00:00-03:00",
    endsAt: "2026-12-01T00:00:00-03:00", // vale até 30/11 às 23:59
    lastDayLabel: "30/11",
    percent: { yearly: 30, monthly: 50 } as Record<BillingCycle, number>,
} as const;

export function promoActive(now: Date = new Date()): boolean {
    const t = now.getTime();
    return t >= new Date(PROMO.startsAt).getTime() && t < new Date(PROMO.endsAt).getTime();
}

// Quem pode usar: nunca teve assinatura paga (nem pelo site, nem pela loja)
export type PromoChurch = {
    pagarme_subscription_id?: string | null;
    pagarme_customer_id?: string | null;
    billing_provider?: string | null;
};

export function promoEligible(church: PromoChurch | null | undefined): boolean {
    if (!church) return true; // conta nova, ainda sem igreja gravada
    if (church.pagarme_subscription_id || church.pagarme_customer_id) return false;
    const p = church.billing_provider ?? null;
    return p === null || p === "bonus"; // "bonus" = mês grátis de indicação, nunca pagou
}

export function promoPercent(cycle: BillingCycle) {
    return PROMO.percent[cycle];
}

// Valor da primeira cobrança com desconto (em centavos)
export function promoPriceCents(plan: PlanInfo, cycle: BillingCycle): number {
    const full = cycle === "yearly" ? plan.yearlyCents : plan.monthlyCents;
    return Math.round((full * (100 - promoPercent(cycle))) / 100);
}

// Desconto que vai para o Pagar.me ao criar a assinatura (só a primeira cobrança)
export function pagarmeDiscount(cycle: BillingCycle) {
    return { value: promoPercent(cycle), discount_type: "percentage", cycles: 1, description: `${PROMO.name} 2026` };
}

// Texto curto do que acontece depois da primeira cobrança
export function promoNote(plan: PlanInfo, cycle: BillingCycle, formatBRL: (c: number) => string): string {
    return cycle === "yearly"
        ? `${promoPercent("yearly")}% off no primeiro ano. Depois, ${formatBRL(plan.yearlyCents)}/ano.`
        : `${promoPercent("monthly")}% off no 1º mês. Depois, ${formatBRL(plan.monthlyCents)}/mês.`;
}

// Tudo o que a tela precisa para mostrar o preço da oferta
export function promoView(plan: PlanInfo, cycle: BillingCycle, formatBRL: (c: number) => string) {
    const fullCents = cycle === "yearly" ? plan.yearlyCents : plan.monthlyCents;
    const cents = promoPriceCents(plan, cycle);
    const unit = cycle === "yearly" ? "ano" : "mês";
    return {
        fullLabel: `${formatBRL(fullCents)}/${unit}`,
        label: cycle === "yearly" ? `${formatBRL(cents)} no 1º ano` : `${formatBRL(cents)} no 1º mês`,
        amount: formatBRL(cents),
        when: cycle === "yearly" ? "no 1º ano" : "no 1º mês",
        badge: `${PROMO.name} · −${promoPercent(cycle)}%`,
        note: promoNote(plan, cycle, formatBRL),
        cents,
    };
}
