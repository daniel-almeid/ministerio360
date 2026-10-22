import { beforeEach, describe, expect, it, vi } from "vitest";
import { post, resetState, state } from "./fakes";

vi.mock("@supabase/supabase-js", async () => {
    const { supabaseProxy } = await import("./fakes");
    return { createClient: () => supabaseProxy };
});
vi.mock("next/server", async () => (await import("./fakes")).nextServerMock);

const { POST } = await import("@/app/api/convite/route");

const URL = "https://ministerio360.vercel.app/api/convite";
const TOKEN = "8f3c2a10-1b2c-4d5e-8f90-123456789abc";
const corpo = (over: Record<string, unknown> = {}) => ({ token: TOKEN, name: "Maria Souza", email: "Maria@Email.com ", password: "segredo123", accepted_terms: true, ...over });

function convite(info: Record<string, unknown>) {
    state.rpc = (fn) => (fn === "get_church_invite" ? { data: info } : {});
}

beforeEach(() => {
    resetState();
    convite({ found: true, status: "valid", email: null });
});

describe("Aceitar convite (criar a conta do convidado)", () => {
    it("cria a conta com e-mail já confirmado e o token do convite", async () => {
        const r = await POST(post(URL, corpo()));
        expect(r.status).toBe(200);
        expect(state.calls.createUser).toEqual([
            {
                email: "maria@email.com",
                password: "segredo123",
                email_confirm: true,
                user_metadata: {
                    name: "Maria Souza",
                    invite_token: TOKEN,
                    terms_version: "2026-10-22",
                    terms_accepted_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
                },
            },
        ]);
    });

    it.each([
        [{ token: "abc" }, 404, "Convite inválido."],
        [{ name: "A" }, 400, "Informe seu nome."],
        [{ email: "maria@" }, 400, "Confira o e-mail digitado."],
        [{ password: "123" }, 400, "A senha precisa ter pelo menos 6 caracteres."],
        [{ password: "x".repeat(73) }, 400, "A senha precisa ter pelo menos 6 caracteres."],
        [{ accepted_terms: false }, 400, "Para continuar, aceite os Termos de Uso e a Política de Privacidade."],
        [{ accepted_terms: "sim" }, 400, "Para continuar, aceite os Termos de Uso e a Política de Privacidade."],
    ])("dados inválidos %o → %i", async (over, status, msg) => {
        const r = await POST(post(URL, corpo(over)));
        expect(r.status).toBe(status);
        expect((await r.json()).error).toBe(msg);
        expect(state.calls.createUser).toHaveLength(0);
    });

    it.each([
        ["used", "Este convite já foi usado."],
        ["revoked", "Este convite foi cancelado pelo pastor."],
        ["expired", "Este convite expirou. Peça um novo ao pastor."],
        ["full", "A igreja atingiu o limite de usuários do plano. Fale com o pastor."],
    ])("convite %s → 409 com mensagem clara", async (status, msg) => {
        convite({ found: true, status });
        const r = await POST(post(URL, corpo()));
        expect(r.status).toBe(409);
        expect((await r.json()).error).toBe(msg);
        expect(state.calls.createUser).toHaveLength(0);
    });

    it("convite inexistente → 404", async () => {
        convite({ found: false });
        expect((await POST(post(URL, corpo()))).status).toBe(404);
    });

    it("convite para outro e-mail → mostra qual usar", async () => {
        convite({ found: true, status: "valid", email: "joao@email.com" });
        const r = await POST(post(URL, corpo()));
        expect(r.status).toBe(400);
        expect((await r.json()).error).toContain("joao@email.com");
    });

    it("convite para o mesmo e-mail (com maiúsculas) funciona", async () => {
        convite({ found: true, status: "valid", email: "maria@email.com" });
        expect((await POST(post(URL, corpo()))).status).toBe(200);
    });

    it("falha ao consultar o convite → 500", async () => {
        state.rpc = () => ({ error: { message: "db fora" } });
        expect((await POST(post(URL, corpo()))).status).toBe(500);
    });

    it.each([
        ["User already registered", 409],
        ["A user with this email address has already been registered", 409],
        ["Password should be at least 8 characters", 400],
        ["Database error saving new user", 500],
    ])("erro ao criar conta: %s → %i", async (message, status) => {
        state.createUser = () => ({ error: { message } });
        expect((await POST(post(URL, corpo()))).status).toBe(status);
    });

    it("corpo que não é JSON → convite inválido", async () => {
        const r = await POST(new Request(URL, { method: "POST", body: "isto não é json" }));
        expect(r.status).toBe(404);
    });
});
