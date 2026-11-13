import { supabase } from "@/lib/supabaseClient";

// Estado do sistema: manutenção (ligada pelo administrador) e se o servidor está respondendo.
// Mesmo código do app (src/shared/systemStatus/systemStatusService.ts).

export type SystemStatus = {
    active: boolean; // manutenção valendo agora
    scheduled: boolean; // ligada, mas começa mais tarde (mostra só o aviso)
    startsAt: string | null;
    endsAt: string | null;
    message: string | null;
    isAdmin: boolean; // administrador da plataforma continua usando durante a manutenção
};

export type StatusCheck =
    | { kind: "ok"; status: SystemStatus }
    // Não chegou ao servidor (sem resposta, tempo esgotado ou servidor fora do ar)
    | { kind: "unreachable" };

export const NO_MAINTENANCE: SystemStatus = {
    active: false,
    scheduled: false,
    startsAt: null,
    endsAt: null,
    message: null,
    isAdmin: false,
};

const TIMEOUT_MS = 10000;

// Respostas que significam "servidor fora do ar" (e não um erro comum)
export function isServerDown(status: number) {
    return status === 0 || status === 408 || status === 502 || status === 503 || status === 504 || (status >= 520 && status <= 529);
}

export function parseStatus(data: unknown): SystemStatus {
    const d = (data ?? {}) as Record<string, unknown>;
    const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    return {
        active: d.active === true,
        scheduled: d.scheduled === true,
        startsAt: text(d.starts_at),
        endsAt: text(d.ends_at),
        message: text(d.message),
        isAdmin: d.is_admin === true,
    };
}

export async function checkSystemStatus(): Promise<StatusCheck> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const request: any = supabase.rpc("get_system_status");
        const { data, error, status } = await (typeof request.abortSignal === "function"
            ? request.abortSignal(controller.signal)
            : request);

        if (error) {
            // Servidor fora do ar ou sem resposta
            if (isServerDown(status)) return { kind: "unreachable" };
            // Qualquer outro erro (ex.: função ainda não criada no banco): segue sem manutenção
            return { kind: "ok", status: NO_MAINTENANCE };
        }

        return { kind: "ok", status: parseStatus(data) };
    } catch {
        return { kind: "unreachable" };
    } finally {
        clearTimeout(timer);
    }
}

// "2026-11-13T02:30:00Z" -> "23:30" (hoje) / "amanhã às 08:00" / "14/11 às 08:00"
export function describeTime(iso: string | null, now = new Date()) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;

    const p = (n: number) => String(n).padStart(2, "0");
    const hour = `${p(d.getHours())}:${p(d.getMinutes())}`;
    const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(d) - day(now)) / 86400000);

    if (diff === 0) return `hoje às ${hour}`;
    if (diff === 1) return `amanhã às ${hour}`;
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} às ${hour}`;
}

// Liga/desliga a manutenção (só administrador)
export async function setMaintenance(input: {
    on: boolean;
    startsAt?: Date | null;
    endsAt?: Date | null;
    message?: string | null;
}): Promise<SystemStatus> {
    const { data, error } = await supabase.rpc("admin_set_maintenance", {
        p_on: input.on,
        p_starts_at: input.startsAt ? input.startsAt.toISOString() : null,
        p_ends_at: input.endsAt ? input.endsAt.toISOString() : null,
        p_message: input.message?.trim() || null,
    });
    if (error) throw error;
    return parseStatus(data);
}

// Opções do cartão de manutenção na Administração (iguais no app e no site)
export const START_OPTIONS = [
    { value: 0, label: "Agora" },
    { value: 15, label: "Em 15 min" },
    { value: 30, label: "Em 30 min" },
    { value: 60, label: "Em 1 hora" },
] as const;

export const DURATION_OPTIONS = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hora" },
    { value: 120, label: "2 horas" },
    { value: 0, label: "Sem previsão" },
] as const;

// Início e previsão de volta a partir das opções escolhidas
export function planWindow(startInMin: number, durationMin: number, now = new Date()) {
    const start = new Date(now.getTime() + startInMin * 60000);
    return {
        startsAt: startInMin > 0 ? start : null,
        endsAt: durationMin > 0 ? new Date(start.getTime() + durationMin * 60000) : null,
    };
}
