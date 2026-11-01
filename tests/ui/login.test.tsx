// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({
    reply: null as null | { code?: string; message: string },
    pushed: [] as string[],
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: (p: string) => fake.pushed.push(p), replace: () => {} }) }));
vi.mock("../../lib/supabaseClient", () => ({
    supabase: {
        auth: {
            signInWithPassword: async () =>
                fake.reply
                    ? { data: { user: null, session: null }, error: fake.reply }
                    : { data: { user: { id: "u1" }, session: {} }, error: null },
            refreshSession: async () => ({ data: { session: null } }),
            setSession: async () => ({}),
            getSession: async () => ({ data: { session: { user: { app_metadata: { plan_slug: "free" } } } } }),
        },
        rpc: async () => ({ data: null, error: null }),
    },
}));

import LoginPage from "@/app/(public)/login/page";

beforeEach(() => {
    fake.reply = null;
    fake.pushed = [];
});

async function entrar(senha = "Segredo@1") {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(document.querySelector('input[type="email"]')!, "pastor@igreja.com");
    await user.type(document.querySelector('input[type="password"]')!, senha);
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    return user;
}

describe("Login do site", () => {
    it("botão de olho mostra e esconde a senha", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);
        const campo = document.querySelector('input[type="password"]') as HTMLInputElement;
        await user.type(campo, "Segredo@1");
        await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
        expect(campo.type).toBe("text");
        await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
        expect(campo.type).toBe("password");
    });

    it("senha errada: mensagem em português", async () => {
        fake.reply = { code: "invalid_credentials", message: "Invalid login credentials" };
        await entrar("errada");
        expect(await screen.findByText("E-mail ou senha incorretos.")).toBeInTheDocument();
        expect(screen.queryByText(/Invalid/)).toBeNull();
    });

    it("e-mail não confirmado: explica o que fazer (antes dizia 'senha incorreta')", async () => {
        fake.reply = { code: "email_not_confirmed", message: "Email not confirmed" };
        await entrar();
        expect(await screen.findByText(/Confirme seu e-mail antes de entrar/)).toBeInTheDocument();
    });

    it("muitas tentativas: pede para aguardar", async () => {
        fake.reply = { message: "For security purposes, you can only request this after 30 seconds." };
        await entrar();
        expect(await screen.findByText(/Muitas tentativas/)).toBeInTheDocument();
    });

    it("login certo: vai para o painel", async () => {
        await entrar();
        await vi.waitFor(() => expect(fake.pushed).toContain("/dashboard"));
    });
});
