// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const acesso = vi.hoisted(() => ({ atual: {} as any, rota: "/membros" }));
const signOut = vi.hoisted(() => vi.fn(async () => ({})));

vi.mock("next/navigation", () => ({ usePathname: () => acesso.rota }));
vi.mock("@/components/shared/access/useMyAccess", () => ({ useMyAccess: () => acesso.atual }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: { auth: { signOut } } }));

import { AccessGate } from "@/components/shared/access/accessGate";

const tela = () => render(<AccessGate><p>Conteúdo da página</p></AccessGate>);

beforeEach(() => {
    acesso.rota = "/membros";
    acesso.atual = { loading: false, paused: false, access: { role: "secretario" }, canOpen: () => true };
    Object.defineProperty(window, "location", { value: { href: "/membros", reload: vi.fn() }, writable: true });
});

describe("Portão de acesso das páginas", () => {
    it("com acesso, mostra a página", () => {
        tela();
        expect(screen.getByText("Conteúdo da página")).toBeInTheDocument();
    });

    it("enquanto carrega, não mostra a página", () => {
        acesso.atual = { ...acesso.atual, loading: true };
        tela();
        expect(screen.getByText("Carregando...")).toBeInTheDocument();
        expect(screen.queryByText("Conteúdo da página")).toBeNull();
    });

    it("sem permissão para a área, bloqueia e oferece voltar ao início", () => {
        const canOpen = vi.fn(() => false);
        acesso.rota = "/financas";
        acesso.atual = { ...acesso.atual, canOpen };
        tela();
        expect(canOpen).toHaveBeenCalledWith("/financas");
        expect(screen.getByText("Você não tem acesso a esta área")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute("href", "/dashboard");
        expect(screen.queryByText("Conteúdo da página")).toBeNull();
    });

    it("usuário pausado vê o aviso e consegue sair", async () => {
        acesso.atual = { ...acesso.atual, paused: true, access: null };
        tela();
        expect(screen.getByText("Seu acesso está pausado")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
        expect(signOut).toHaveBeenCalled();
        expect(window.location.href).toBe("/login");
    });

    it("se o acesso não carregou (sem internet), pede para recarregar", async () => {
        acesso.atual = { ...acesso.atual, access: null };
        tela();
        expect(screen.getByText("Não foi possível carregar")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Recarregar" }));
        expect(window.location.reload).toHaveBeenCalled();
    });
});
