import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabaseClient", () => ({ supabase: {} }));
import {
    describeTime,
    isServerDown,
    NO_MAINTENANCE,
    parseStatus,
    planWindow,
} from "@/lib/systemStatus";
import { decideView } from "@/lib/systemStatusView";

const base = { online: true, status: NO_MAINTENANCE, failures: 0, loadedOnce: true };

describe("Qual tela mostrar (manutenção, sem internet, instabilidade)", () => {
    it("tudo certo: nenhuma tela por cima", () => {
        expect(decideView(base)).toBe("ok");
    });

    it("manutenção ligada: todos veem a tela, menos o administrador", () => {
        const on = { ...NO_MAINTENANCE, active: true };
        expect(decideView({ ...base, status: on })).toBe("maintenance");
        expect(decideView({ ...base, status: { ...on, isAdmin: true } })).toBe("ok");
    });

    it("manutenção só programada: ainda não bloqueia (mostra o aviso)", () => {
        expect(decideView({ ...base, status: { ...NO_MAINTENANCE, scheduled: true } })).toBe("ok");
    });

    it("sem internet ao abrir: tela cheia; sem internet depois de carregar: só a faixa", () => {
        expect(decideView({ ...base, online: false, loadedOnce: false })).toBe("offline");
        expect(decideView({ ...base, online: false, loadedOnce: true })).toBe("ok");
    });

    it("instabilidade só depois de 2 falhas seguidas com internet", () => {
        expect(decideView({ ...base, failures: 1 })).toBe("ok");
        expect(decideView({ ...base, failures: 2 })).toBe("unstable");
        expect(decideView({ ...base, online: false, failures: 3 })).toBe("ok");
    });
});

describe("Respostas do servidor", () => {
    it("sem resposta ou servidor fora do ar conta como instabilidade", () => {
        for (const s of [0, 502, 503, 504, 522]) expect(isServerDown(s)).toBe(true);
        for (const s of [200, 400, 401, 404, 500]) expect(isServerDown(s)).toBe(false);
    });

    it("lê o estado vindo do banco", () => {
        expect(
            parseStatus({ active: true, scheduled: false, starts_at: null, ends_at: "2026-11-14T02:30:00Z", message: "  ", is_admin: false })
        ).toEqual({ active: true, scheduled: false, startsAt: null, endsAt: "2026-11-14T02:30:00Z", message: null, isAdmin: false });
        expect(parseStatus(null)).toEqual(NO_MAINTENANCE);
    });
});

describe("Horários da manutenção", () => {
    const now = new Date("2026-11-13T22:00:00-03:00");

    it("começar agora com 30 min de previsão", () => {
        const w = planWindow(0, 30, now);
        expect(w.startsAt).toBeNull();
        expect(w.endsAt?.toISOString()).toBe("2026-11-14T01:30:00.000Z");
    });

    it("programada para daqui a 1 hora, sem previsão de volta", () => {
        const w = planWindow(60, 0, now);
        expect(w.startsAt?.toISOString()).toBe("2026-11-14T02:00:00.000Z");
        expect(w.endsAt).toBeNull();
    });

    it("escreve o horário do jeito que a pessoa lê", () => {
        expect(describeTime("2026-11-14T02:30:00Z", now)).toBe("hoje às 23:30");
        expect(describeTime("2026-11-14T11:00:00Z", now)).toBe("amanhã às 08:00");
        expect(describeTime("2026-11-16T11:00:00Z", now)).toBe("16/11 às 08:00");
        expect(describeTime(null, now)).toBeNull();
    });
});
