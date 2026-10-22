// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({ token: "jwt-1" as string | null }));
vi.mock("@/lib/supabaseClient", () => ({
    supabase: { auth: { getSession: async () => ({ data: { session: sessao.token ? { access_token: sessao.token } : null } }) } },
}));

import CancelSubscriptionModal from "@/app/(protected)/planos/assinatura/components/modal/cancelSubscriptionModal";
import FooterActions from "@/app/(protected)/planos/assinatura/components/footerActions";

let resposta: { status: number; json: any };
let chamadas: { url: string; headers: any }[] = [];

beforeEach(() => {
    sessao.token = "jwt-1";
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
    render(<CancelSubscriptionModal open planName="Premium" formattedExpiresOn="20/11/2026" onClose={onClose} onCanceled={onCanceled} />);
    return { onClose, onCanceled, user: userEvent.setup() };
}

describe("Cancelar a renovação (site)", () => {
    it("explica até quando vale e a regra dos 7 dias antes de cancelar", () => {
        abrir();
        expect(screen.getByText("Cancelar a renovação?")).toBeInTheDocument();
        expect(screen.getByText("20/11/2026")).toBeInTheDocument();
        expect(screen.getByText(/arrependimento em até 7 dias/)).toBeInTheDocument();
        expect(chamadas).toHaveLength(0);
    });

    it("manter assinatura fecha sem chamar nada", async () => {
        const { user, onClose, onCanceled } = abrir();
        await user.click(screen.getByRole("button", { name: "Manter assinatura" }));
        expect(onClose).toHaveBeenCalled();
        expect(onCanceled).not.toHaveBeenCalled();
        expect(chamadas).toHaveLength(0);
    });

    it("cancela com o login do Pastor e confirma; ao fechar, recarrega a assinatura", async () => {
        const { user, onCanceled } = abrir();
        await user.click(screen.getByRole("button", { name: "Cancelar renovação" }));
        expect(await screen.findByText("Renovação cancelada")).toBeInTheDocument();
        expect(chamadas[0].url).toBe("/api/pagarme/cancel-subscription");
        expect(chamadas[0].headers.Authorization).toBe("Bearer jwt-1");
        await user.click(screen.getByRole("button", { name: "Entendi" }));
        expect(onCanceled).toHaveBeenCalled();
    });

    it("erro do servidor aparece e permite tentar de novo", async () => {
        resposta = { status: 403, json: { error: "Somente o Pastor da igreja pode cancelar a assinatura." } };
        const { user } = abrir();
        await user.click(screen.getByRole("button", { name: "Cancelar renovação" }));
        expect(await screen.findByText("Somente o Pastor da igreja pode cancelar a assinatura.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancelar renovação" })).toBeEnabled();
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
