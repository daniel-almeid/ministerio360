"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// O que o usuário logado pode acessar (vem do banco: my_access)
export type Level = "none" | "view" | "edit" | "own" | "all";
export type AreaKey = "membros" | "visitantes" | "ministerios" | "agenda" | "escalas" | "financas";

export type MyAccess = {
    platform_admin: boolean;
    church_id: string | null;
    role: "pastor" | "tesoureiro" | "secretaria" | "lider" | null;
    status: "active" | "paused" | null;
    permissions: Record<AreaKey, Level> | null;
    ministry_ids: string[] | null;
};

// Uma busca só por página (menu e telas usam o mesmo resultado)
let cache: MyAccess | null = null;
let cacheUser: string | null = null; // de quem é o acesso guardado
let pending: Promise<MyAccess | null> | null = null;

export async function loadMyAccess(force = false): Promise<MyAccess | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id ?? null;
    if (userId !== cacheUser) {
        cache = null; // trocou de conta: busca de novo
        pending = null;
    }

    if (cache && !force) return cache;
    if (pending && !force) return pending;
    pending = (async () => {
        const { data, error } = await supabase.rpc("my_access");
        cache = error ? null : (data as MyAccess);
        cacheUser = userId;
        pending = null;
        return cache;
    })();
    return pending;
}

const RANK: Record<Level, number> = { none: 0, view: 1, own: 2, edit: 3, all: 3 };
const NEED = { view: 1, edit: 2, all: 3 } as const;

export function can(access: MyAccess | null, area: AreaKey, level: keyof typeof NEED = "view") {
    if (!access || access.status !== "active") return false;
    if (access.role === "pastor") return true;
    const value = access.permissions?.[area] ?? "none";
    return RANK[value] >= NEED[level];
}

export function isPastor(access: MyAccess | null) {
    return !!access && access.status === "active" && access.role === "pastor";
}

// Quem pode abrir cada página do site (pelo começo do endereço)
export function canOpen(access: MyAccess | null, path: string) {
    const p = path.split("?")[0];
    if (p.startsWith("/membros")) return can(access, "membros");
    if (p.startsWith("/visitantes")) return can(access, "visitantes");
    if (p.startsWith("/ministries")) return can(access, "ministerios");
    if (p.startsWith("/financas")) return can(access, "financas");
    if (p.startsWith("/relatorios")) return can(access, "membros") || can(access, "financas");
    if (p.startsWith("/agenda")) return can(access, "agenda") || can(access, "escalas");
    if (p.startsWith("/configuracoes") || p.startsWith("/usuarios")) return isPastor(access);
    // Dashboard, Planos (precisa abrir quando a assinatura está pendente) e Admin (confere sozinho)
    return !!access && access.status === "active";
}

export function useMyAccess() {
    const [access, setAccess] = useState<MyAccess | null>(cache);
    const [loading, setLoading] = useState(!cache);

    useEffect(() => {
        let alive = true;
        loadMyAccess().then((a) => {
            if (!alive) return;
            setAccess(a);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, []);

    return {
        access,
        loading,
        paused: access?.status === "paused",
        can: (area: AreaKey, level: "view" | "edit" | "all" = "view") => can(access, area, level),
        canOpen: (path: string) => canOpen(access, path),
        // Pode editar uma escala com estes ministérios? (todas, ou só os ministérios que lidera)
        canEditScale: (ministryIds: string[]) =>
            can(access, "escalas", "all") ||
            (can(access, "escalas", "edit") &&
                ministryIds.length > 0 &&
                ministryIds.every((id) => (access?.ministry_ids ?? []).includes(id))),
        myMinistryIds: access?.ministry_ids ?? [],
        isPastor: isPastor(access),
    };
}
