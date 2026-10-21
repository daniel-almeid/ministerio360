// =====================================================================
// Planos do Ministério360 — fonte única de nomes, preços e recursos
// (o valor cobrado de verdade vem da tabela "plans" + Pagar.me;
//  se mudar preço lá, mude aqui também)
// =====================================================================

export type PlanSlug = "free" | "standard" | "premium_basic" | "premium";
export type BillingCycle = "monthly" | "yearly";

export const PLAN_SLUGS: PlanSlug[] = ["free", "standard", "premium_basic", "premium"];

export function isPlanSlug(value: unknown): value is PlanSlug {
    return typeof value === "string" && (PLAN_SLUGS as string[]).includes(value);
}

// Nível de acesso às telas: Premium e Premium+ liberam as mesmas telas
export const PLAN_LEVEL: Record<PlanSlug, number> = {
    free: 1,
    standard: 2,
    premium_basic: 3,
    premium: 3,
};

export function planLevel(slug: unknown) {
    return isPlanSlug(slug) ? PLAN_LEVEL[slug] : 1;
}

export type PlanInfo = {
    slug: PlanSlug;
    name: string;
    tagline: string;
    users: number | null; // null = ilimitado
    monthlyCents: number;
    yearlyCents: number; // anual = 10 mensalidades (2 meses grátis)
    maxInstallments: number; // parcelas do anual no cartão
    highlight?: boolean;
    features: string[];
};

const BASE_PREMIUM = [
    "Dashboard",
    "Cadastro de membros",
    "Cadastro de visitantes",
    "Acompanhamento de visitantes",
    "Cadastro financeiro",
    "Cadastro de ministérios",
    "Cadastro de eventos",
    "Cadastro de escalas",
    "Relatórios completos",
];

export const PLANS: PlanInfo[] = [
    {
        slug: "free",
        name: "Grátis",
        tagline: "Recursos básicos",
        users: 1,
        monthlyCents: 0,
        yearlyCents: 0,
        maxInstallments: 1,
        features: ["1 usuário", "Dashboard", "Cadastro de membros", "Cadastro financeiro", "Relatórios simples"],
    },
    {
        slug: "standard",
        name: "Padrão",
        tagline: "Para começar a organizar",
        users: 3,
        monthlyCents: 3990,
        yearlyCents: 39900,
        maxInstallments: 12,
        features: [
            "Até 3 usuários",
            "Dashboard",
            "Cadastro de membros",
            "Cadastro de visitantes",
            "Acompanhamento de visitantes",
            "Cadastro financeiro",
            "Relatórios simples",
        ],
    },
    {
        slug: "premium_basic",
        name: "Premium",
        tagline: "Todas as telas",
        users: 5,
        monthlyCents: 6990,
        yearlyCents: 69900,
        maxInstallments: 12,
        highlight: true,
        features: ["Até 5 usuários", ...BASE_PREMIUM],
    },
    {
        slug: "premium",
        name: "Premium+",
        tagline: "Para equipes maiores",
        users: null,
        monthlyCents: 9990,
        yearlyCents: 99900,
        maxInstallments: 12,
        features: ["Usuários ilimitados", ...BASE_PREMIUM, "Suporte prioritário"],
    },
];

export const PLAN_NAME: Record<PlanSlug, string> = {
    free: "Grátis",
    standard: "Padrão",
    premium_basic: "Premium",
    premium: "Premium+",
};

export function getPlan(slug: unknown): PlanInfo {
    return PLANS.find((p) => p.slug === slug) ?? PLANS[0];
}

export function formatBRL(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function priceCents(plan: PlanInfo, cycle: BillingCycle) {
    return cycle === "yearly" ? plan.yearlyCents : plan.monthlyCents;
}

// "R$ 39,90/mês" · "R$ 399,00/ano" · "R$ 0/mês"
export function priceLabel(plan: PlanInfo, cycle: BillingCycle) {
    if (plan.monthlyCents === 0) return "R$ 0/mês";
    return `${formatBRL(priceCents(plan, cycle))}/${cycle === "yearly" ? "ano" : "mês"}`;
}

// No anual: "equivale a R$ 33,25/mês"
export function monthlyEquivalent(plan: PlanInfo) {
    return `equivale a ${formatBRL(Math.round(plan.yearlyCents / 12))}/mês`;
}

// "12x de R$ 83,25"
export function installmentLabel(totalCents: number, times: number) {
    return times <= 1 ? `À vista · ${formatBRL(totalCents)}` : `${times}x de ${formatBRL(Math.round(totalCents / times))}`;
}

export const CYCLE_LABEL: Record<BillingCycle, string> = { monthly: "Mensal", yearly: "Anual" };
export const YEARLY_BADGE = "2 meses grátis";
