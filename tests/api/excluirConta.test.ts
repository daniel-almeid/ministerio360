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

beforeEach(() => {
    resetState({
        db: { church_profiles: [{ id: "c1", user_id: "u1", pagarme_subscription_id: "sub_1" }] },
        users: [
            { id: "u1", email: "pastor@igreja.com" },
            { id: "u2", email: "tes@igreja.com" },
        ],
        passwords: { "pastor@igreja.com": "certa", "tes@igreja.com": "outra" },
    });
});

describe("Excluir conta (página pública)", () => {
    it("pede e-mail e senha", async () => {
        expect((await POST(post(URL, { email: "pastor@igreja.com" }))).status).toBe(400);
    });

    it("senha errada não apaga nada", async () => {
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, { email: "pastor@igreja.com", password: "errada" }));
        expect(r.status).toBe(401);
        expect(calls).toHaveLength(0);
        expect(state.calls.deletedUsers).toHaveLength(0);
        expect(state.db.church_profiles).toHaveLength(1);
    });

    it("titular: cancela a assinatura, apaga a igreja e a conta", async () => {
        const { calls } = mockPagarme({ "DELETE subscriptions/sub_1": () => ({ json: {} }) });
        const r = await POST(post(URL, { email: "pastor@igreja.com", password: "certa" }));
        expect(r.status).toBe(200);
        expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual(["DELETE subscriptions/sub_1"]);
        expect(state.db.church_profiles).toHaveLength(0);
        expect(state.calls.deletedUsers).toEqual(["u1"]);
    });

    it("usuário convidado (não titular): apaga só a conta dele", async () => {
        const { calls } = mockPagarme({});
        const r = await POST(post(URL, { email: "tes@igreja.com", password: "outra" }));
        expect(r.status).toBe(200);
        expect(calls).toHaveLength(0);
        expect(state.db.church_profiles).toHaveLength(1);
        expect(state.calls.deletedUsers).toEqual(["u2"]);
    });
});
