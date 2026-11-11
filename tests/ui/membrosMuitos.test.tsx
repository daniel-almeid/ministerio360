// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Banco falso com 2.500 membros que, como o Supabase, entrega no máximo 1.000 linhas por consulta
const fake = vi.hoisted(() => {
    const ministries = [
        { id: "min-louvor", name: "Louvor" },
        { id: "min-midia", name: "Mídia" },
    ];
    const members = Array.from({ length: 2500 }, (_, i) => ({
        id: `m${String(i).padStart(4, "0")}`,
        name: `Membro ${String(i).padStart(4, "0")}`,
        email: null,
        phone: null,
        is_active: i % 5 !== 0,
        birth_date: null,
        ministry_id: i % 10 === 0 ? "min-midia" : "min-louvor",
        ministries: { name: i % 10 === 0 ? "Mídia" : "Louvor" },
    }));
    const visitors = Array.from({ length: 2500 }, (_, i) => ({ id: `v${i}`, name: `Visitante ${i}`, archived: false }));
    const pdf: { count: number } = { count: -1 };

    function query(rows: any[]) {
        let list = [...rows];
        let head = false;
        let count = false;
        const like = (v: string, pattern: string) => v.toLowerCase().includes(pattern.replace(/%/g, "").toLowerCase());
        const q: any = {
            select: (_: string, opts?: { count?: string; head?: boolean }) => {
                count = !!opts?.count;
                head = !!opts?.head;
                return q;
            },
            eq: (col: string, v: unknown) => ((list = list.filter((r) => r[col] === v)), q),
            ilike: (col: string, p: string) => ((list = list.filter((r) => like(String(r[col]), p))), q),
            or: (expr: string) => {
                const name = /name\.ilike\.([^,]+)/.exec(expr)?.[1] ?? "";
                const ids = (/ministry_id\.in\.\(([^)]*)\)/.exec(expr)?.[1] ?? "").split(",");
                list = list.filter((r) => like(r.name, name) || ids.includes(r.ministry_id));
                return q;
            },
            order: () => q,
            range: (from: number, to: number) => {
                const total = list.length;
                const page = list.slice(from, Math.min(to + 1, from + 1000)); // limite de 1.000 por resposta
                return Promise.resolve({ data: head ? null : page, error: null, count: count ? total : null });
            },
            then: (ok: any) => Promise.resolve({ data: list.slice(0, 1000), error: null, count: list.length }).then(ok),
        };
        return q;
    }

    return { members, ministries, visitors, pdf, query };
});

vi.mock("@/lib/supabaseClient", () => ({
    supabase: { from: (t: string) => fake.query(t === "ministries" ? fake.ministries : t === "visitors" ? fake.visitors : fake.members) },
}));
vi.mock("../../lib/supabaseClient", () => ({
    supabase: { from: (t: string) => fake.query(t === "ministries" ? fake.ministries : t === "visitors" ? fake.visitors : fake.members) },
}));
vi.mock("@/app/(protected)/membros/utils/generateMembersPdf", () => ({
    generateMembersPdf: ({ members }: { members: unknown[] }) => {
        fake.pdf.count = members.length;
    },
}));
vi.mock("react-hot-toast", () => ({
    default: Object.assign(() => {}, { loading: () => "t", success: () => {}, error: () => {} }),
}));

import { useMembersData } from "@/app/(protected)/membros/hook/useMembersData";
import { fetchAllPages } from "@/lib/fetchAllPages";

describe("Igreja com mais de 1.000 membros (site)", () => {
    it("lista em páginas de 10 direto do banco, com o total certo", async () => {
        const { result } = renderHook(() => useMembersData());
        await act(() => result.current.loadMembers());

        expect(result.current.paginatedMembers).toHaveLength(10);
        expect(result.current.totalItems).toBe(2500);
        expect(result.current.totalPages).toBe(250);

        // Uma página depois do milésimo membro
        act(() => result.current.setCurrentPage(200));
        await waitFor(() => expect(result.current.currentPage).toBe(200));
        await act(() => result.current.loadMembers());
        expect(result.current.paginatedMembers[0].name).toBe("Membro 1990");
    });

    it("a busca encontra quem está depois do milésimo, por nome ou ministério", async () => {
        const { result } = renderHook(() => useMembersData());

        act(() => result.current.setSearch("Membro 2401"));
        await waitFor(() => expect(result.current.search).toBe("Membro 2401"));
        await act(() => result.current.loadMembers());
        expect(result.current.paginatedMembers.map((m) => m.name)).toEqual(["Membro 2401"]);

        act(() => result.current.setSearch("mídia"));
        await waitFor(() => expect(result.current.search).toBe("mídia"));
        await act(() => result.current.loadMembers());
        expect(result.current.totalItems).toBe(250);
        expect(result.current.currentPage).toBe(1);
    });

    it("filtro de status conta no banco", async () => {
        const { result } = renderHook(() => useMembersData());
        act(() => result.current.setStatusFilter("inactive"));
        await waitFor(() => expect(result.current.statusFilter).toBe("inactive"));
        await act(() => result.current.loadMembers());
        expect(result.current.totalItems).toBe(500);
    });

    it("o PDF sai com todos os membros, não só os 1.000 primeiros", async () => {
        const { result } = renderHook(() => useMembersData());
        await act(() => result.current.exportPdf("Igreja"));
        expect(fake.pdf.count).toBe(2500);
    });

    it("busca todas as páginas até acabar", async () => {
        const rows = await fetchAllPages<any>((from, to) => fake.query(fake.members).select("*").range(from, to));
        expect(rows).toHaveLength(2500);
    });
});

describe("Igreja com mais de 1.000 visitantes (site)", () => {
    it("a lista de visitantes vem inteira", async () => {
        const { getVisitors } = await import("@/app/services/visitors");
        const visitors = await getVisitors(false);
        // o banco falso devolve os 2.500 registros da tabela, em páginas de no máximo 1.000
        expect(visitors).toHaveLength(2500);
    });
});
