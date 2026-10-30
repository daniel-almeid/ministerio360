// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Supabase simulado: login, função "retencao-assinatura" e a tabela de motivos
const fake = vi.hoisted(() => ({
    token: "jwt-1" as string | null,
    eligible: true,
    accept: null as null | (() => { data: unknown; error: unknown }),
    invokes: [] as any[],
    feedbacks: [] as any[],
}));
vi.mock("@/lib/supabaseClient", () => ({
    supabase: {
        auth: {
            getSession: async () => ({ data: { session: fake.token ? { access_token: fake.token } : null } }),
            getUser: async () => ({ data: { user: { id: "user-1", app_metadata: { church_id: "igreja-1" } } } }),
        },
        functions: {
            invoke: async (name: string, opts: { body: any }) => {
                fake.invokes.push({ name, ...opts.body });
                if (opts.body.action === "status") {
                    return { data: { eligible: fake.eligible, percent: 30, cycles: 3, billing_cycle: "monthly" }, error: null };
                }
                return fake.accept ? fake.accept() : { data: { success: true, percent: 30, cycles: 3 }, error: null };
            },
        },
        from: (table: string) => ({
            insert: async (row: any) => {
                if (table === "subscription_cancel_feedback") fake.feedbacks.push(row);
                return { error: null };
            },
        }),
    },
}));

import CancelSubscriptionModal from "@/app/(protected)/planos/assinatura/components/modal/cancelSubscriptionModal";
import FooterActions from "@/app/(protected)/planos/assinatura/components/footerActions";

let resposta: { status: number; json: any };
let chamadas: { url: string; headers: any }[] = [];

beforeEach(() => {
    fake.token = "jwt-1";
    fake.eligible = true;
    fake.accept = null;
    fake.invokes = [];
    fake.feedbacks = [];
    chamadas = [];
    resposta = { status: 200, json: { success: true, access_until: "2026-11-21T02:59:59Z" } };
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
        chamadas.push({ url, headers: init.headers });
        return new Response(JSON.stringify(resposta.json), { status: resposta.status });
    }));
});

function abrir() {
    const onClose = vi.fn();
    const onCanceled = vi.fn();
    render(
        <CancelSubscriptionModal
            open
            planName="Premium"
            planSlug="premium_basic"
            billingCycle="monthly"
            formattedExpiresOn="20/11/2026"
            onClose={onClose}
            onCanceled={onCanceled}
        />,
    );
    return { onClose, onCanceled, user: userEvent.setup() };
}

const botao = (name: string | RegExp) => screen.getByRole("button", { name });
const accepts = () => fake.invokes.filter((i) => i.action === "accept");
// O preço vem com espaço especial (R$ 48,93); compara sem ele
const texto = (t: string) => (_: string, el: Element | null) => el?.textContent?.replace(/\s/g, " ") === t;

describe("Cancelar com retenção (site)", () => {
    it("caminho completo: motivo → resposta → tem certeza → oferta → aceita o desconto", async () => {
        const { user, onCanceled } = abrir();
        expect(screen.getByText("Por que você quer cancelar?")).toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: "Falta algum recurso que preciso" }));
        await user.click(botao("Continuar cancelamento"));
        expect(screen.getByText("Queremos construir isso com você")).toBeInTheDocument();
        await user.type(screen.getByPlaceholderText("Escreva aqui"), "Controle de células");

        await user.click(botao("Continuar cancelamento"));
        expect(screen.getByText("Tem certeza?")).toBeInTheDocument();
        expect(screen.getByText("20/11/2026")).toBeInTheDocument();
        expect(screen.getByText("Até 5 usuários — a equipe convidada perde o acesso")).toBeInTheDocument();
        expect(screen.getByText("Cadastro de escalas")).toBeInTheDocument();
        expect(screen.getByText(/arrependimento em até 7 dias/)).toBeInTheDocument();

        await user.click(botao("Continuar cancelamento"));
        expect(await screen.findByText("30% OFF")).toBeInTheDocument();
        expect(screen.getByText("30% de desconto nas próximas 3 mensalidades")).toBeInTheDocument();
        expect(screen.getByText(texto("R$ 48,93/mês"))).toBeInTheDocument();

        await user.click(botao("Quero o desconto"));
        expect(await screen.findByText("Desconto aplicado!")).toBeInTheDocument();
        expect(accepts()).toEqual([
            { name: "retencao-assinatura", action: "accept", reason: "falta_recurso", details: "Controle de células" },
        ]);
        expect(chamadas).toHaveLength(0); // nada foi cancelado

        await user.click(botao("Continuar usando"));
        expect(onCanceled).toHaveBeenCalled(); // recarrega a assinatura
    });

    it("recusa a oferta e cancela com o login do Pastor", async () => {
        const { user, onCanceled } = abrir();
        await user.click(screen.getByRole("radio", { name: "Estamos usando pouco" }));
        await user.click(botao("Continuar cancelamento"));
        expect(screen.getByText("Dá para tirar mais proveito")).toBeInTheDocument();
        await user.click(botao("Continuar cancelamento"));
        await user.click(botao("Continuar cancelamento"));
        await user.click(await screen.findByRole("button", { name: "Não, quero cancelar a renovação" }));

        expect(await screen.findByText("Renovação cancelada")).toBeInTheDocument();
        expect(chamadas[0].url).toBe("/api/pagarme/cancel-subscription");
        expect(chamadas[0].headers.Authorization).toBe("Bearer jwt-1");
        expect(accepts()).toHaveLength(0);
        expect(fake.feedbacks).toEqual([expect.objectContaining({ reason: "pouco_uso", outcome: "canceled", church_id: "igreja-1" })]);
        await user.click(botao("Entendi"));
        expect(onCanceled).toHaveBeenCalled();
    });

    it("sem direito a desconto (já usou no ano): cancela direto no 'Tem certeza?'", async () => {
        fake.eligible = false;
        const { user } = abrir();
        await user.click(botao("Pular e continuar"));
        expect(screen.getByText("Tudo bem")).toBeInTheDocument();
        await user.click(botao("Continuar cancelamento"));
        await user.click(await screen.findByRole("button", { name: "Cancelar renovação" }));

        expect(await screen.findByText("Renovação cancelada")).toBeInTheDocument();
        expect(screen.queryByText("30% OFF")).toBeNull();
        expect(fake.feedbacks[0]).toEqual(expect.objectContaining({ reason: "nao_informado", outcome: "canceled" }));
    });

    it("'Está caro' leva direto à oferta", async () => {
        const { user } = abrir();
        await user.click(screen.getByRole("radio", { name: "Está caro para a igreja" }));
        await user.click(botao("Continuar cancelamento"));
        await user.click(await screen.findByRole("button", { name: "Ver condição especial" }));
        expect(screen.getByText("30% OFF")).toBeInTheDocument();
    });

    it("'Problemas' mostra o e-mail do suporte", async () => {
        const { user } = abrir();
        await user.click(screen.getByRole("radio", { name: "Tive problemas ou erros no sistema" }));
        await user.click(botao("Continuar cancelamento"));
        expect(screen.getByRole("link", { name: /danielandrade_2001@hotmail.com/ })).toHaveAttribute(
            "href",
            "mailto:danielandrade_2001@hotmail.com",
        );
    });

    it("'Manter assinatura' fecha, guarda o motivo e não cancela", async () => {
        const { user, onClose, onCanceled } = abrir();
        await user.click(screen.getByRole("radio", { name: "Vamos usar outro sistema" }));
        await user.click(botao("Continuar cancelamento"));
        await user.click(botao("Manter assinatura"));
        expect(onClose).toHaveBeenCalled();
        expect(onCanceled).not.toHaveBeenCalled();
        expect(chamadas).toHaveLength(0);
        expect(fake.feedbacks).toEqual([expect.objectContaining({ reason: "outro_sistema", outcome: "kept" })]);
    });

    it("erro ao aplicar o desconto aparece e continua na oferta", async () => {
        fake.accept = () => ({
            data: null,
            error: { context: { json: async () => ({ error: "O desconto já foi usado nos últimos 12 meses." }) } },
        });
        const { user } = abrir();
        await user.click(screen.getByRole("radio", { name: "Está caro para a igreja" }));
        await user.click(botao("Continuar cancelamento"));
        await user.click(await screen.findByRole("button", { name: "Ver condição especial" }));
        await user.click(botao("Quero o desconto"));
        expect(await screen.findByText("O desconto já foi usado nos últimos 12 meses.")).toBeInTheDocument();
        expect(botao("Quero o desconto")).toBeEnabled();
    });

    it("erro do servidor ao cancelar aparece e permite tentar de novo", async () => {
        fake.eligible = false;
        resposta = { status: 403, json: { error: "Somente o Pastor da igreja pode cancelar a assinatura." } };
        const { user } = abrir();
        await user.click(botao("Pular e continuar"));
        await user.click(botao("Continuar cancelamento"));
        await user.click(await screen.findByRole("button", { name: "Cancelar renovação" }));
        expect(await screen.findByText("Somente o Pastor da igreja pode cancelar a assinatura.")).toBeInTheDocument();
        expect(botao("Cancelar renovação")).toBeEnabled();
    });
});

describe("Rodapé da assinatura", () => {
    const base = { hasPaidPlan: true, hasAutoRenewal: true, renewalCanceled: false, formattedExpiresOn: "20/11/2026", onCancelClick: () => {} };

    it("plano pago com renovação: mostra o botão de cancelar", () => {
        render(<FooterActions {...base} />);
        expect(screen.getByRole("button", { name: "Cancelar assinatura" })).toBeInTheDocument();
    });

    it("renovação já cancelada: mostra até quando vale e esconde o botão", () => {
        render(<FooterActions {...base} renewalCanceled />);
        expect(screen.getByText(/renovação automática foi cancelada/)).toBeInTheDocument();
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("plano sem renovação automática (liberado pelo suporte): sem botão", () => {
        render(<FooterActions {...base} hasAutoRenewal={false} />);
        expect(screen.getByText("Este plano não tem renovação automática.")).toBeInTheDocument();
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("plano Grátis: convida para o upgrade", () => {
        render(<FooterActions {...base} hasPaidPlan={false} />);
        expect(screen.getByText(/Faça um upgrade/)).toBeInTheDocument();
    });
});
