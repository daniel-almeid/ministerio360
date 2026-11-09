// Programa de indicação: qual prêmio dar para a igreja que indicou (regras puras, sem rede)
import { getPlan } from "./plans";

export const REWARD_DAYS = 30;
export const BONUS_PLAN = "premium_basic"; // "Premium"

export type ChurchRow = {
    id: string;
    user_id: string | null;
    plan_slug: string | null;
    subscription_active: boolean | null;
    billing_provider: string | null;
    billing_cycle: string | null;
    pagarme_subscription_id: string | null;
    canceled_at: string | null;
    plan_expires_at: string | null;
    store_product_id: string | null;
};

export type Reward =
    | {
          kind: "pagarme_desconto";
          subscriptionId: string;
          discount: { value: number; discount_type: "percentage" | "flat"; cycles: 1 };
          note: string;
      }
    | { kind: "loja_adiamento"; productId: string; note: string }
    | { kind: "bonus_premium" | "bonus_extensao" | "acesso_extensao"; update: Record<string, unknown>; note: string }
    | { kind: "manual"; note: string };

const isStore = (p: string | null) => p === "google_play" || p === "app_store";
const paidPlan = (c: ChurchRow) => !!c.plan_slug && c.plan_slug !== "free";

// A igreja paga de verdade? (mesma regra da função church_is_paying no banco)
export function isPaying(c: ChurchRow) {
    return (
        !!c.subscription_active &&
        paidPlan(c) &&
        c.billing_provider !== "bonus" &&
        (!!c.pagarme_subscription_id || isStore(c.billing_provider))
    );
}

// Indicada que pagou e depois cancelou ou pediu o dinheiro de volta dentro dos 7 dias: não premia
export function referredStillPaying(c: ChurchRow) {
    return isPaying(c) && !c.canceled_at;
}

function plusDays(from: Date, days: number) {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    return d.toISOString();
}

// Soma 30 dias a partir do fim atual (ou de hoje, se já passou)
function extend(expires: string | null, now: Date) {
    const base = expires && Date.parse(expires) > now.getTime() ? new Date(expires) : now;
    return plusDays(base, REWARD_DAYS);
}

export function chooseReward(referrer: ChurchRow, now = new Date()): Reward {
    const active = !!referrer.subscription_active && paidPlan(referrer);
    const until = referrer.plan_expires_at ? Date.parse(referrer.plan_expires_at) : 0;

    // 1) Assina pela loja: a renovação é adiada em 30 dias (RevenueCat)
    if (active && isStore(referrer.billing_provider)) {
        const productId = (referrer.store_product_id ?? "").split(":")[0];
        if (!productId) return { kind: "manual", note: "Assinatura da loja sem o código do produto." };
        return { kind: "loja_adiamento", productId, note: `Renovação na loja adiada em ${REWARD_DAYS} dias.` };
    }

    // 2) Assina pelo site com renovação ligada: a próxima cobrança sai de graça
    if (active && referrer.billing_provider !== "bonus" && referrer.pagarme_subscription_id && !referrer.canceled_at) {
        const yearly = referrer.billing_cycle === "yearly";
        const monthlyCents = getPlan(referrer.plan_slug).monthlyCents;
        return {
            kind: "pagarme_desconto",
            subscriptionId: referrer.pagarme_subscription_id,
            discount: yearly
                ? { value: monthlyCents, discount_type: "flat", cycles: 1 }
                : { value: 100, discount_type: "percentage", cycles: 1 },
            note: yearly ? "Desconto de 1 mês na próxima cobrança anual." : "Próxima mensalidade grátis.",
        };
    }

    // 3) Já está no mês grátis de outra indicação: soma mais 30 dias
    if (active && referrer.billing_provider === "bonus" && until > now.getTime()) {
        return {
            kind: "bonus_extensao",
            update: { plan_expires_at: extend(referrer.plan_expires_at, now) },
            note: `Mais ${REWARD_DAYS} dias de ${getPlan(referrer.plan_slug).name}.`,
        };
    }

    // 4) Plano pago sem renovação (cancelou e ainda está no período, ou liberado pelo admin): +30 dias de acesso
    if (active && until > now.getTime()) {
        return {
            kind: "acesso_extensao",
            update: { plan_expires_at: extend(referrer.plan_expires_at, now) },
            note: `Acesso ao plano estendido em ${REWARD_DAYS} dias.`,
        };
    }

    // 5) Grátis (ou plano vencido): 30 dias de Premium
    return {
        kind: "bonus_premium",
        update: {
            plan_slug: BONUS_PLAN,
            billing_cycle: "monthly",
            subscription_active: true,
            billing_provider: "bonus",
            plan_expires_at: plusDays(now, REWARD_DAYS),
            canceled_at: null,
            current_period_end: null,
        },
        note: `${REWARD_DAYS} dias de ${getPlan(BONUS_PLAN).name} grátis.`,
    };
}
