// =====================================================================
// Supabase e Pagar.me simulados para testar as rotas do servidor
// sem internet, sem banco e sem cobrar ninguém.
// =====================================================================
import { vi } from "vitest";

type Row = Record<string, any>;
type Filter = [string, unknown];

export type FakeDb = Record<string, Row[]>;

export type FakeUser = { id: string; email: string };

export type FakeState = {
    db: FakeDb;
    // token de login -> usuário (rota com "Authorization: Bearer ...")
    sessions: Record<string, FakeUser>;
    // todas as contas (auth.users), para a busca por e-mail
    users: FakeUser[];
    // senhas (para a rota de excluir conta)
    passwords: Record<string, string>;
    rpc: (fn: string, args: any) => { data?: any; error?: any };
    createUser: (attrs: any) => { data?: any; error?: any };
    calls: {
        rpc: { fn: string; args: any }[];
        updates: { table: string; values: Row; filters: Filter[] }[];
        removed: { table: string; filters: Filter[] }[];
        createUser: any[];
        deletedUsers: string[];
    };
};

export const state: FakeState = newState();

export function newState(): FakeState {
    return {
        db: {},
        sessions: {},
        users: [],
        passwords: {},
        rpc: () => ({ data: null, error: null }),
        createUser: () => ({ data: { user: { id: "novo" } }, error: null }),
        calls: { rpc: [], updates: [], removed: [], createUser: [], deletedUsers: [] },
    };
}

export function resetState(over: Partial<FakeState> = {}) {
    Object.assign(state, newState(), over);
}

function query(table: string) {
    const filters: Filter[] = [];
    let mode: "select" | "update" | "remove" = "select";
    let values: Row = {};

    const match = () => (state.db[table] ?? []).filter((r) => filters.every(([c, v]) => r[c] === v));

    const api: any = {
        select: () => api,
        eq: (col: string, val: unknown) => {
            filters.push([col, val]);
            return api;
        },
        update: (v: Row) => {
            mode = "update";
            values = v;
            return api;
        },
        delete: () => {
            mode = "remove";
            return api;
        },
        single: async () => {
            const rows = match();
            return rows.length === 1 ? { data: { ...rows[0] }, error: null } : { data: null, error: { message: "not found" } };
        },
        maybeSingle: async () => ({ data: match()[0] ? { ...match()[0] } : null, error: null }),
        then: (resolve: (v: unknown) => void, reject: (e: unknown) => void) => {
            let result: unknown;
            if (mode === "update") {
                match().forEach((r) => Object.assign(r, values));
                state.calls.updates.push({ table, values, filters: [...filters] });
                result = { data: null, error: null };
            } else if (mode === "remove") {
                const keep = (state.db[table] ?? []).filter((r) => !filters.every(([c, v]) => r[c] === v));
                state.db[table] = keep;
                state.calls.removed.push({ table, filters: [...filters] });
                result = { data: null, error: null };
            } else {
                result = { data: match().map((r) => ({ ...r })), error: null };
            }
            return Promise.resolve(result).then(resolve, reject);
        },
    };
    return api;
}

// O mesmo "cliente" serve para todas as chamadas a createClient
export const supabaseProxy = {
    from: (table: string) => query(table),
    rpc: async (fn: string, args: any) => {
        state.calls.rpc.push({ fn, args });
        const r = state.rpc(fn, args) ?? {};
        return { data: r.data ?? null, error: r.error ?? null };
    },
    auth: {
        getUser: async (token: string) => {
            const user = state.sessions[token];
            return user ? { data: { user }, error: null } : { data: { user: null }, error: { message: "invalid" } };
        },
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
            const user = state.users.find((u) => u.email === email);
            return user && state.passwords[email] === password
                ? { data: { user }, error: null }
                : { data: { user: null }, error: { message: "Invalid login" } };
        },
        admin: {
            listUsers: async ({ page = 1, perPage = 50 }: { page?: number; perPage?: number } = {}) => ({
                data: { users: state.users.slice((page - 1) * perPage, page * perPage) },
                error: null,
            }),
            createUser: async (attrs: any) => {
                state.calls.createUser.push(attrs);
                const r = state.createUser(attrs) ?? {};
                return { data: r.data ?? null, error: r.error ?? null };
            },
            deleteUser: async (id: string) => {
                state.calls.deletedUsers.push(id);
                return { data: null, error: null };
            },
        },
    },
};

// next/server simplificado (só o que as rotas usam)
export const nextServerMock = {
    NextResponse: {
        json: (body: unknown, init?: { status?: number }) =>
            new Response(JSON.stringify(body), { status: init?.status ?? 200, headers: { "content-type": "application/json" } }),
    },
};

// ------------------------------------------------------------- Pagar.me
export type PagarmeCall = { method: string; path: string; body: any };

export function mockPagarme(routes: Record<string, (body: any) => { status?: number; json: any }>) {
    const calls: PagarmeCall[] = [];
    const fetchMock = vi.fn(async (url: string, init: RequestInit = {}) => {
        const method = (init.method ?? "GET").toUpperCase();
        const path = String(url).replace("https://api.pagar.me/core/v5/", "");
        const body = init.body ? JSON.parse(String(init.body)) : null;
        calls.push({ method, path, body });
        const key = Object.keys(routes).find((k) => {
            const [m, p] = k.split(" ");
            return m === method && new RegExp(`^${p}$`).test(path);
        });
        if (!key) return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
        const r = routes[key](body);
        return new Response(JSON.stringify(r.json), { status: r.status ?? 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    return { calls, fetchMock };
}

export function post(url: string, body: unknown, headers: Record<string, string> = {}) {
    return new Request(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
}
