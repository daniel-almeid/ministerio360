import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPagarme, post, resetState, state } from "./fakes";

vi.mock("@supabase/supabase-js", async () => {
    const { supabaseProxy } = await import("./fakes");
    return { createClient: () => supabaseProxy };
});
vi.mock("next/server", async () => (await import("./fakes")).nextServerMock);

process.env.PAGARME_SECRET_KEY = "sk_test_fake";
const { POST } = await import("@/app/api/account/delete/route");

const URL = "https://ministerio360.vercel.app/api/account/delete";
const TITULAR = { email: "pastor@igreja.com", password: "certa" };

// O que o banco responde em account_deletion_info / delete_account
let info: Record<string, unknown>;
let deleteError: { message: string } | null;

const rpcs = () => state.calls.rpc.map((c) => c.fn);
const excluiu = () => state.calls.rpc.find((c) => c.fn === "delete_account")?.args;

beforeEach(() => {
    resetState({
        users: [
            { id: "u1", email: "pastor@igreja.com" },
            { id: "u2", email: "tes@igreja.com" },
        ],
        passwords: { "pastor@igreja.com": "certa", "tes@igreja.com": "outra" },
    });
    info = {
        mode: "delete_church",
        church_id: "c1",
        church_name: "Igreja Central",
        successor_id: null,
        successor_name: null,
        other_users: 2,
        subscription_id: "sub_1",
    };
    deleteError = null;
    state.rpc = (fn) => {
        if (fn === "account_deletion_info") return { data: info };
        if (fn === "delete_account") return deleteError ? { error: deleteError } : { data: { mode: info.mode } };
        return {};
    };
});

describe("Excluir conta: conferência antes de apagar", () => {
    it("pede e-mail e senha", async () => {
        expect((await POST(post(URL, { email: "pastor@igreja.com" }))).status).toBe(400);
    });

    it("senha errada não confere nem apaga nada", async () => {
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, { ...TITULAR, password: "errada", confirm: true, mode: "delete_church" }));
        expect(r.status).toBe(401);
        expect(rpcs()).toEqual([]);
        expect(calls).toHaveLength(0);
    });

    it("sem confirmar, só mostra o que vai acontecer (sem o id da assinatura)", async () => {
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, TITULAR));
        expect(r.status).toBe(200);
        expect(await r.json()).toEqual({
            preview: { mode: "delete_church", church_name: "Igreja Central", successor_name: null, other_users: 2, has_subscription: true },
        });
        expect(rpcs()).toEqual(["account_deletion_info"]);
        expect(calls).toHaveLength(0);
    });

    it("titular com outro Pastor: a conferência mostra para quem a igreja vai", async () => {
        info = { ...info, mode: "transfer", successor_id: "u3", successor_name: "Pastor João" };
        const r = await POST(post(URL, TITULAR));
        expect((await r.json()).preview).toMatchObject({ mode: "transfer", successor_name: "Pastor João" });
    });

    it("conta de administrador não é excluída por aqui", async () => {
        info = { mode: "blocked" };
        const r = await POST(post(URL, { ...TITULAR, confirm: true, mode: "blocked" }));
        expect(r.status).toBe(403);
        expect(excluiu()).toBeUndefined();
    });

    it("se a situação mudou desde a conferência, não apaga e mostra a nova", async () => {
        info = { ...info, mode: "transfer", successor_name: "Pastor João" };
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }));
        expect(r.status).toBe(409);
        expect((await r.json()).preview.mode).toBe("transfer");
        expect(excluiu()).toBeUndefined();
        expect(calls).toHaveLength(0);
    });
});

describe("Excluir conta: confirmada", () => {
    it("titular com outro Pastor: não cancela a assinatura (a igreja continua)", async () => {
        info = { ...info, mode: "transfer", successor_id: "u3", successor_name: "Pastor João" };
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, { ...TITULAR, confirm: true, mode: "transfer" }));
        expect(r.status).toBe(200);
        expect(await r.json()).toEqual({ success: true, mode: "transfer" });
        expect(calls).toHaveLength(0);
        expect(excluiu()).toEqual({ p_user_id: "u1", p_expected_mode: "transfer" });
    });

    it("usuário convidado: só a conta dele, sem mexer na assinatura", async () => {
        info = { mode: "user_only", church_name: "Igreja Central", subscription_id: null };
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, { email: "tes@igreja.com", password: "outra", confirm: true, mode: "user_only" }));
        expect(r.status).toBe(200);
        expect(calls).toHaveLength(0);
        expect(excluiu()).toEqual({ p_user_id: "u2", p_expected_mode: "user_only" });
    });

    it("titular sozinho: cancela a assinatura ANTES e depois apaga tudo", async () => {
        const { calls } = mockPagarme({ "DELETE subscriptions/sub_1": () => ({ json: { status: "canceled" } }) });
        const r = await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }));
        expect(r.status).toBe(200);
        expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual(["DELETE subscriptions/sub_1"]);
        expect(calls[0].body).toEqual({ cancel_pending_invoices: true });
        expect(excluiu()).toEqual({ p_user_id: "u1", p_expected_mode: "delete_church" });
    });

    it("assinatura já cancelada no Pagar.me: segue com a exclusão", async () => {
        mockPagarme({
            "DELETE subscriptions/sub_1": () => ({ status: 412, json: { message: "already canceled" } }),
            "GET subscriptions/sub_1": () => ({ json: { status: "canceled" } }),
        });
        const r = await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }));
        expect(r.status).toBe(200);
        expect(excluiu()).toBeDefined();
    });

    it("Pagar.me fora do ar: NÃO apaga nada", async () => {
        mockPagarme({
            "DELETE subscriptions/sub_1": () => ({ status: 503, json: {} }),
            "GET subscriptions/sub_1": () => ({ status: 503, json: {} }),
        });
        const r = await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }));
        expect(r.status).toBe(502);
        expect((await r.json()).error).toMatch(/nada foi apagado/);
        expect(excluiu()).toBeUndefined();
    });

    it("assinatura ainda ativa depois da tentativa: NÃO apaga nada", async () => {
        mockPagarme({
            "DELETE subscriptions/sub_1": () => ({ status: 400, json: {} }),
            "GET subscriptions/sub_1": () => ({ json: { status: "active" } }),
        });
        expect((await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }))).status).toBe(502);
        expect(excluiu()).toBeUndefined();
    });

    it("titular sozinho sem assinatura: apaga sem chamar o Pagar.me", async () => {
        info = { ...info, subscription_id: null };
        const { calls } = mockPagarme({});
        expect((await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }))).status).toBe(200);
        expect(calls).toHaveLength(0);
    });

    it("erro no banco depois de cancelar: avisa que a assinatura foi cancelada", async () => {
        deleteError = { message: "falhou" };
        mockPagarme({ "DELETE subscriptions/sub_1": () => ({ json: {} }) });
        const r = await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }));
        expect(r.status).toBe(500);
        expect((await r.json()).error).toMatch(/assinatura foi cancelada/);
    });

    it("banco recusa porque a situação mudou: 409", async () => {
        info = { ...info, subscription_id: null };
        deleteError = { message: "A situação da igreja mudou. Confira de novo antes de excluir." };
        mockPagarme({});
        expect((await POST(post(URL, { ...TITULAR, confirm: true, mode: "delete_church" }))).status).toBe(409);
    });
});
