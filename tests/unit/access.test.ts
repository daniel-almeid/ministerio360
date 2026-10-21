import { beforeEach, describe, expect, it, vi } from "vitest";

// O módulo fala com o Supabase: aqui ele é simulado
const rpc = vi.fn();
const getSession = vi.fn();
vi.mock("@/lib/supabaseClient", () => ({ supabase: { rpc, auth: { getSession } } }));

const { can, canOpen, isPastor, loadMyAccess } = await import("@/components/shared/access/useMyAccess");
type Access = Parameters<typeof can>[0];

const NONE = { membros: "none", visitantes: "none", ministerios: "none", agenda: "none", escalas: "none", financas: "none" } as const;
const user = (role: string, permissions: Record<string, string>, status = "active") =>
    ({ platform_admin: false, church_id: "c1", role, status, permissions: { ...NONE, ...permissions }, ministry_ids: [] }) as unknown as Access;

const pastor = user("pastor", {});
const tesoureiro = user("tesoureiro", { membros: "view", agenda: "view", financas: "edit" });
const lider = user("lider", { membros: "view", ministerios: "view", agenda: "edit", escalas: "own" });
const pausado = user("tesoureiro", { financas: "edit" }, "paused");

describe("can(): mesma regra do banco", () => {
    it("Pastor pode tudo", () => {
        expect(can(pastor, "financas", "edit")).toBe(true);
        expect(can(pastor, "escalas", "all")).toBe(true);
    });

    it("ver x editar x nenhum", () => {
        expect(can(tesoureiro, "membros", "view")).toBe(true);
        expect(can(tesoureiro, "membros", "edit")).toBe(false);
        expect(can(tesoureiro, "financas", "edit")).toBe(true);
        expect(can(tesoureiro, "visitantes", "view")).toBe(false);
    });

    it("escalas 'meus ministérios' conta como editar, mas não como todas", () => {
        expect(can(lider, "escalas", "view")).toBe(true);
        expect(can(lider, "escalas", "edit")).toBe(true);
        expect(can(lider, "escalas", "all")).toBe(false);
    });

    it("pausado ou sem acesso não pode nada", () => {
        expect(can(pausado, "financas", "view")).toBe(false);
        expect(can(null, "membros", "view")).toBe(false);
        expect(isPastor(user("pastor", {}, "paused"))).toBe(false);
        expect(isPastor(pastor)).toBe(true);
        expect(isPastor(tesoureiro)).toBe(false);
    });
});

describe("canOpen(): quem abre cada página do site", () => {
    it("tesoureiro", () => {
        expect(canOpen(tesoureiro, "/financas")).toBe(true);
        expect(canOpen(tesoureiro, "/membros?page=2")).toBe(true);
        expect(canOpen(tesoureiro, "/visitantes")).toBe(false);
        expect(canOpen(tesoureiro, "/ministries")).toBe(false);
        expect(canOpen(tesoureiro, "/agenda")).toBe(true);
        expect(canOpen(tesoureiro, "/relatorios")).toBe(true);
        expect(canOpen(tesoureiro, "/usuarios")).toBe(false);
        expect(canOpen(tesoureiro, "/configuracoes")).toBe(false);
        expect(canOpen(tesoureiro, "/dashboard")).toBe(true);
        expect(canOpen(tesoureiro, "/planos")).toBe(true);
    });

    it("Agenda & Escalas abre com qualquer uma das duas", () => {
        expect(canOpen(user("lider", { escalas: "view" }), "/agenda")).toBe(true);
        expect(canOpen(user("lider", {}), "/agenda")).toBe(false);
    });

    it("Relatórios precisa de membros ou finanças", () => {
        expect(canOpen(user("secretaria", { membros: "view" }), "/relatorios")).toBe(true);
        expect(canOpen(user("secretaria", { agenda: "edit" }), "/relatorios")).toBe(false);
    });

    it("Pastor abre Usuários e Configurações", () => {
        expect(canOpen(pastor, "/usuarios")).toBe(true);
        expect(canOpen(pastor, "/configuracoes")).toBe(true);
    });

    it("pausado não abre nem o Dashboard", () => {
        expect(canOpen(pausado, "/dashboard")).toBe(false);
        expect(canOpen(null, "/dashboard")).toBe(false);
    });
});

describe("loadMyAccess(): busca uma vez e refaz ao trocar de conta", () => {
    beforeEach(() => {
        rpc.mockReset();
        getSession.mockReset();
    });

    it("guarda o resultado e só busca de novo para outra conta", async () => {
        getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } });
        rpc.mockResolvedValue({ data: pastor, error: null });

        await loadMyAccess();
        await loadMyAccess();
        expect(rpc).toHaveBeenCalledTimes(1);

        getSession.mockResolvedValue({ data: { session: { user: { id: "u2" } } } });
        rpc.mockResolvedValue({ data: tesoureiro, error: null });
        const second = await loadMyAccess();
        expect(rpc).toHaveBeenCalledTimes(2);
        expect(second?.role).toBe("tesoureiro");
    });

    it("erro do banco vira 'sem acesso'", async () => {
        getSession.mockResolvedValue({ data: { session: { user: { id: "u3" } } } });
        rpc.mockResolvedValue({ data: null, error: { message: "falhou" } });
        expect(await loadMyAccess(true)).toBeNull();
    });
});
