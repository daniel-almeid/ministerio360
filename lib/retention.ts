// Fluxo de retenção no cancelamento: motivos, respostas e o que a igreja perde.
// Só lógica (sem tela), para poder testar. Mesmo texto do app (src/features/plans/retention.ts).
import { LEGAL } from "./legal";
import { formatBRL, getPlan, priceCents } from "./plans";
import type { BillingCycle, PlanSlug } from "./plans";

export type CancelReason =
    | "caro"
    | "pouco_uso"
    | "falta_recurso"
    | "problemas"
    | "outro_sistema"
    | "igreja_parou"
    | "outro"
    | "nao_informado";

export const REASONS: { value: Exclude<CancelReason, "nao_informado">; label: string }[] = [
    { value: "caro", label: "Está caro para a igreja" },
    { value: "pouco_uso", label: "Estamos usando pouco" },
    { value: "falta_recurso", label: "Falta algum recurso que preciso" },
    { value: "problemas", label: "Tive problemas ou erros no sistema" },
    { value: "outro_sistema", label: "Vamos usar outro sistema" },
    { value: "igreja_parou", label: "A igreja parou ou fechou" },
    { value: "outro", label: "Outro motivo" },
];

export type ReasonAnswer = {
    title: string;
    text: string;
    // Pede um comentário (opcional) para o usuário contar mais
    askDetails?: string;
    // Mostra o contato do suporte
    showSupport?: boolean;
};

export function reasonAnswer(reason: CancelReason): ReasonAnswer {
    switch (reason) {
        case "caro":
            return {
                title: "Entendemos — o orçamento da igreja é sagrado",
                text: "Antes de decidir, veja a condição especial que preparamos para que a igreja continue com tudo funcionando pagando menos.",
            };
        case "pouco_uso":
            return {
                title: "Dá para tirar mais proveito",
                text: "Muitas igrejas usam mais quando a equipe participa: convide os líderes, cadastre as escalas e os eventos e acompanhe os visitantes pelo app ou pelo site. Tudo fica num lugar só.",
            };
        case "falta_recurso":
            return {
                title: "Queremos construir isso com você",
                text: "O Ministério360 evolui a partir do que as igrejas pedem. Conte qual recurso faz falta — sua resposta vai direto para quem desenvolve o Ministério360.",
                askDetails: "Qual recurso faz falta?",
            };
        case "problemas":
            return {
                title: "Sentimos muito pelo problema",
                text: "Fale com a gente antes de sair: a maioria dos problemas é resolvida rápido. Conte o que aconteceu ou escreva para o suporte.",
                askDetails: "O que aconteceu?",
                showSupport: true,
            };
        case "outro_sistema":
            return {
                title: "Podemos saber qual?",
                text: "Queremos entender o que o outro sistema oferece que o Ministério360 ainda não tem. Seus dados continuam guardados se quiser voltar.",
                askDetails: "Qual sistema e por quê?",
            };
        case "igreja_parou":
            return {
                title: "Sentimos muito",
                text: "Se as atividades voltarem, seus cadastros continuam guardados: nenhum dado é apagado quando a igreja passa para o plano Grátis.",
            };
        case "outro":
            return {
                title: "Conte para a gente",
                text: "Sua opinião ajuda a melhorar o Ministério360 para todas as igrejas.",
                askDetails: "Qual o motivo?",
            };
        default:
            return {
                title: "Tudo bem",
                text: "Você não precisa dizer o motivo. Antes de continuar, veja o que muda para a igreja.",
            };
    }
}

// O que a igreja deixa de ter ao voltar para o plano Grátis
export function lostFeatures(planSlug: PlanSlug): string[] {
    const plan = getPlan(planSlug);
    const free = getPlan("free");
    const isUsers = (f: string) => /usu[aá]rio/i.test(f);
    const lost: string[] = [];

    if (plan.users === null || plan.users > 1) {
        lost.push(
            plan.users === null
                ? "Usuários ilimitados — a equipe convidada perde o acesso"
                : `Até ${plan.users} usuários — a equipe convidada perde o acesso`,
        );
    }
    for (const f of plan.features) {
        if (isUsers(f) || free.features.includes(f)) continue;
        lost.push(f);
    }
    return lost;
}

export type RetentionOffer = {
    percent: number;
    cycles: number;
    billingCycle: BillingCycle;
};

// Texto da oferta: "30% de desconto nas próximas 3 mensalidades"
export function offerText({ percent, cycles, billingCycle }: RetentionOffer) {
    if (billingCycle === "yearly") return `${percent}% de desconto na próxima renovação anual`;
    return cycles === 1
        ? `${percent}% de desconto na próxima mensalidade`
        : `${percent}% de desconto nas próximas ${cycles} mensalidades`;
}

// Preço com desconto, para mostrar "de R$ 69,90 por R$ 48,93"
export function offerPrices(planSlug: PlanSlug, { percent, billingCycle }: RetentionOffer) {
    const full = priceCents(getPlan(planSlug), billingCycle);
    const discounted = Math.round(full * (1 - percent / 100));
    const unit = billingCycle === "yearly" ? "ano" : "mês";
    return { from: `${formatBRL(full)}/${unit}`, to: `${formatBRL(discounted)}/${unit}`, savedCents: full - discounted };
}

export const SUPPORT_EMAIL = LEGAL.EMAIL;
