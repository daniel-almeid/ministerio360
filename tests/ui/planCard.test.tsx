// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({
    atual: { access_token: "jwt-123", user: { email: "pastor@igreja.com", user_metadata: { name: "Pastor João" } } } as any,
}));
const refreshSession = vi.hoisted(() => vi.fn(async () => ({})));

vi.mock("@/lib/supabaseClient", () => ({
    supabase: { auth: { getSession: async () => ({ data: { session: sessao.atual } }), refreshSession } },
}));

import PlanCard from "@/app/(protected)/planos/components/planCard";
import CycleToggle from "@/app/(protected)/planos/components/cycleToggle";
import { getPlan } from "@/lib/plans";

type Chamada = { url: string; body: any; headers: Record<string, string> };
let chamadas: Chamada[] = [];

function mockApis(assinatura: { status?: number; json?: unknown } = {}) {
    chamadas = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit = {}) => {
        chamadas.push({ url, body: init.body ? JSON.parse(String(init.body)) : null, headers: (init.headers ?? {}) as Record<string, string> });
        if (url.includes("api.pagar.me/core/v5/tokens")) return new Response(JSON.stringify({ id: "tok_cartao" }));
        if (url === "/api/pagarme/create-subscription")
            return new Response(JSON.stringify(assinatura.json ?? { success: true }), { status: assinatura.status ?? 200 });
        return new Response("{}", { status: 404 });
    }));
}

beforeEach(() => {
    Object.defineProperty(window, "location", { value: { reload: vi.fn() }, writable: true });
    mockApis();
});

async function assinar(user: ReturnType<typeof userEvent.setup>, parcelas?: string) {
    await user.click(screen.getByRole("button", { name: "Assinar" }));
    const p = (t: string) => screen.getByPlaceholderText(t);
    await user.type(p("Número do cartão"), "4111111111111111");
    await user.type(p("Nome impresso no cartão"), "Pastor Joao");
    await user.type(p("MM"), "12");
    await user.type(p("AA"), "30");
    await user.type(p("CVV"), "123");
    await user.type(p("CPF ou CNPJ"), "12345678909");
    await user.type(p("DDD"), "11");
    await user.type(p("Telefone"), "999998888");
    await user.type(p("CEP"), "11010000");
    await user.type(p("Rua"), "Rua 1");
    await user.type(p("Número"), "10");
    await user.type(p("Complemento (apto, bloco...)"), "Sala 2");
    await user.type(p("Cidade"), "Santos");
    await user.type(p("UF"), "SP");
    if (parcelas) await user.selectOptions(screen.getByRole("combobox"), parcelas);
    await user.click(screen.getByRole("button", { name: "Confirmar assinatura" }));
}

describe("Cartão do plano", () => {
    it("mensal: preço por mês, sem equivalente", () => {
        render(<PlanCard plan={getPlan("premium_basic")} cycle="monthly" current="free" active={false} />);
        expect(screen.getByText(/^R\$\s69,90\/mês$/)).toBeInTheDocument();
        expect(screen.queryByText(/equivale a/)).toBeNull();
        expect(screen.getByText("Recomendado")).toBeInTheDocument();
    });

    it("anual: preço por ano e quanto dá por mês", () => {
        render(<PlanCard plan={getPlan("standard")} cycle="yearly" current="free" active={false} />);
        expect(screen.getByText(/^R\$\s399,00\/ano$/)).toBeInTheDocument();
        expect(screen.getByText(/equivale a R\$\s33,25\/mês/)).toBeInTheDocument();
    });

    it("plano atual ativo não deixa assinar de novo", () => {
        render(<PlanCard plan={getPlan("premium")} cycle="monthly" current="premium" active />);
        expect(screen.getByRole("button", { name: "Plano atual" })).toBeDisabled();
        expect(screen.queryByRole("button", { name: "Assinar" })).toBeNull();
    });

    it("plano atual vencido permite assinar de novo", () => {
        render(<PlanCard plan={getPlan("premium")} cycle="monthly" current="premium" active={false} />);
        expect(screen.getByRole("button", { name: "Assinar" })).toBeEnabled();
    });

    it("plano grátis não tem botão de assinar", () => {
        render(<PlanCard plan={getPlan("free")} cycle="yearly" current="standard" active />);
        expect(screen.getByRole("button", { name: "Gratuito" })).toBeDisabled();
        expect(screen.queryByText(/equivale a/)).toBeNull();
    });
});

describe("Assinar pelo cartão do plano (fluxo completo na tela)", () => {
    it("anual em 12x: gera o token do cartão e envia a assinatura logado", async () => {
        const user = userEvent.setup();
        render(<PlanCard plan={getPlan("premium_basic")} cycle="yearly" current="free" active={false} />);
        await assinar(user, "12");

        const token = chamadas.find((c) => c.url.includes("tokens"))!;
        expect(token.body.card).toEqual({ number: "4111111111111111", holder_name: "PASTOR JOAO", exp_month: "12", exp_year: "30", cvv: "123" });

        const envio = chamadas.find((c) => c.url === "/api/pagarme/create-subscription")!;
        expect(envio.headers.Authorization).toBe("Bearer jwt-123");
        expect(envio.body).toMatchObject({
            plan_slug: "premium_basic",
            billing_cycle: "yearly",
            installments: 12,
            card_token: "tok_cartao",
            email: "pastor@igreja.com",
            name: "Pastor João",
            phone: { area_code: "11", number: "999998888" },
            address: { line_1: "Rua 1, 10 - Sala 2", zip_code: "11010-000", city: "Santos", state: "SP" },
        });
        expect(refreshSession).toHaveBeenCalled();
        expect(window.location.reload).toHaveBeenCalled();
    });

    it("mensal sempre vai à vista", async () => {
        const user = userEvent.setup();
        render(<PlanCard plan={getPlan("standard")} cycle="monthly" current="free" active={false} />);
        expect(screen.getByRole("button", { name: "Assinar" })).toBeInTheDocument();
        await assinar(user);
        const envio = chamadas.find((c) => c.url === "/api/pagarme/create-subscription")!;
        expect(envio.body).toMatchObject({ billing_cycle: "monthly", installments: 1 });
    });

    it("recusa do servidor aparece no formulário e a página não recarrega", async () => {
        mockApis({ status: 402, json: { error: "Pagamento recusado pelo cartão. Verifique os dados ou use outro cartão." } });
        const user = userEvent.setup();
        render(<PlanCard plan={getPlan("standard")} cycle="monthly" current="free" active={false} />);
        await assinar(user);
        expect(await screen.findByText(/Pagamento recusado pelo cartão/)).toBeInTheDocument();
        expect(window.location.reload).not.toHaveBeenCalled();
    });

    it("sessão expirada avisa para entrar de novo", async () => {
        sessao.atual = null;
        const user = userEvent.setup();
        render(<PlanCard plan={getPlan("standard")} cycle="monthly" current="free" active={false} />);
        await assinar(user);
        expect(await screen.findByText("Sessão expirada. Faça login novamente.")).toBeInTheDocument();
        expect(chamadas.filter((c) => !c.url.includes("viacep"))).toHaveLength(0); // nem gerou token do cartão
    });
});

describe("Botão Mensal / Anual", () => {
    it("troca o ciclo e mostra o selo do anual", async () => {
        const onChange = vi.fn();
        render(<CycleToggle value="monthly" onChange={onChange} />);
        const anual = screen.getByRole("button", { name: /Anual/ });
        expect(within(anual).getByText("2 meses grátis")).toBeInTheDocument();
        await userEvent.click(anual);
        expect(onChange).toHaveBeenCalledWith("yearly");
    });
});
