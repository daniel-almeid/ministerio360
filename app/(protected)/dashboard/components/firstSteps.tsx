"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Banknote,
    Building2,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    UserPlus,
    Users,
    UsersRound,
    type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { PLAN_LEVEL, isPlanSlug } from "@/lib/plans";
import { useMyAccess } from "@/components/shared/access/useMyAccess";

// Primeiros passos da igreja nova (o mesmo roteiro do app). Só o Pastor vê; cada passo fica
// marcado sozinho quando a igreja faz o que ele pede, e o bloco some quando tudo estiver feito.

type StepKey = "igreja" | "membros" | "entrada" | "ministerios" | "equipe";

type Progress = {
    churchInfo: boolean;
    members: number;
    transactions: number;
    ministries: number;
    seatsUsed: number;
    seatLimit: number | null;
};

type Step = { key: StepKey; title: string; hint: string; href: string; icon: LucideIcon; done: boolean };

const ALL: (Omit<Step, "done"> & { needs?: (planLevel: number, p: Progress) => boolean })[] = [
    {
        key: "igreja",
        title: "Complete os dados da igreja",
        hint: "Nome, CNPJ e endereço aparecem nos recibos.",
        href: "/configuracoes",
        icon: Building2,
    },
    {
        key: "membros",
        title: "Cadastre os membros",
        hint: "Um a um ou importando uma planilha.",
        href: "/membros",
        icon: Users,
    },
    {
        key: "entrada",
        title: "Lance a primeira entrada",
        hint: "Dízimo, oferta ou outra entrada em Finanças.",
        href: "/financas",
        icon: Banknote,
    },
    {
        key: "ministerios",
        title: "Crie os ministérios",
        hint: "Louvor, recepção, infantil... para montar as escalas.",
        href: "/ministries",
        icon: UsersRound,
        needs: (level) => level >= PLAN_LEVEL.premium_basic,
    },
    {
        key: "equipe",
        title: "Convide sua equipe",
        hint: "Tesoureiro, secretaria e líderes, cada um com seu acesso.",
        href: "/usuarios",
        icon: UserPlus,
        // Só faz sentido quando o plano permite mais de 1 usuário
        needs: (_level, p) => p.seatLimit === null || p.seatLimit > 1,
    },
];

function isDone(key: StepKey, p: Progress) {
    switch (key) {
        case "igreja":
            return p.churchInfo;
        case "membros":
            return p.members > 0;
        case "entrada":
            return p.transactions > 0;
        case "ministerios":
            return p.ministries > 0;
        case "equipe":
            return p.seatsUsed > 1;
    }
}

const count = async (table: string) => {
    const { count: n, error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) throw error;
    return n ?? 0;
};

async function fetchProgress(churchId: string): Promise<Progress> {
    const [info, members, transactions, ministries, seats] = await Promise.all([
        supabase
            .from("church_institutional_info")
            .select("trade_name, corporate_name, cnpj, address")
            .eq("church_id", churchId)
            .maybeSingle(),
        count("members"),
        count("transactions"),
        count("ministries"),
        supabase.rpc("church_seat_info"),
    ]);

    const i = info.data as Record<string, string | null> | null;
    const filled = (v?: string | null) => !!v && v.trim().length > 0;
    const seat = (seats.data ?? {}) as { used?: number; limit?: number | null };

    return {
        churchInfo: !!i && (filled(i.trade_name) || filled(i.corporate_name)) && (filled(i.cnpj) || filled(i.address)),
        members,
        transactions,
        ministries,
        seatsUsed: seat.used ?? 1,
        seatLimit: seat.limit === undefined ? 1 : seat.limit,
    };
}

// Guardado no navegador, por igreja: passos já concluídos e se o bloco está recolhido
type Saved = { done: StepKey[]; collapsed: boolean };
const storageKey = (churchId: string) => `first_steps:${churchId}`;

function loadSaved(churchId: string): Saved {
    try {
        const v = JSON.parse(localStorage.getItem(storageKey(churchId)) ?? "null");
        return { done: Array.isArray(v?.done) ? v.done : [], collapsed: !!v?.collapsed };
    } catch {
        return { done: [], collapsed: false };
    }
}

function saveSaved(churchId: string, value: Saved) {
    try {
        localStorage.setItem(storageKey(churchId), JSON.stringify(value));
    } catch {
        // navegador sem armazenamento: só não lembra
    }
}

export function FirstSteps() {
    const router = useRouter();
    const { isPastor } = useMyAccess();
    const [steps, setSteps] = useState<Step[] | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [churchId, setChurchId] = useState<string | null>(null);

    useEffect(() => {
        if (!isPastor) return;
        let alive = true;

        (async () => {
            const { data } = await supabase.auth.getSession();
            const meta = data.session?.user?.app_metadata;
            const id = meta?.church_id as string | undefined;
            if (!id) return;

            const slug = meta?.plan_slug;
            const level = PLAN_LEVEL[isPlanSlug(slug) ? slug : "free"];
            const saved = loadSaved(id);

            try {
                const progress = await fetchProgress(id);
                const list = ALL.filter((s) => !s.needs || s.needs(level, progress)).map(({ needs, ...s }) => ({
                    ...s,
                    done: saved.done.includes(s.key) || isDone(s.key, progress),
                }));
                const done = list.filter((s) => s.done).map((s) => s.key);
                if (done.some((k) => !saved.done.includes(k))) saveSaved(id, { done, collapsed: saved.collapsed });
                if (!alive) return;
                setChurchId(id);
                setCollapsed(saved.collapsed);
                setSteps(list);
            } catch {
                // Sem conexão: não mostra o bloco desta vez
            }
        })();

        return () => {
            alive = false;
        };
    }, [isPastor]);

    if (!isPastor || !steps || steps.length === 0 || steps.every((s) => s.done)) return null;

    const done = steps.filter((s) => s.done).length;
    const total = steps.length;

    function toggle() {
        const next = !collapsed;
        setCollapsed(next);
        if (churchId) saveSaved(churchId, { done: (steps ?? []).filter((s) => s.done).map((s) => s.key), collapsed: next });
    }

    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#CFEBE6]">
            <button
                type="button"
                onClick={toggle}
                aria-expanded={!collapsed}
                className="w-full flex items-center gap-3 text-left"
            >
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1E3A5F]">Primeiros passos</h3>
                    <p className="text-sm text-gray-500">
                        {done} de {total} concluídos{collapsed ? "" : " · deixe sua igreja pronta para usar"}
                    </p>
                </div>
                <span className="w-9 h-9 rounded-lg bg-[#E6FFFA] flex items-center justify-center text-[#0F766E]">
                    {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </span>
            </button>

            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mt-3">
                <div
                    className="h-full bg-[#0F766E] rounded-full transition-all"
                    style={{ width: `${Math.round((done / Math.max(total, 1)) * 100)}%` }}
                />
            </div>

            {!collapsed && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-4">
                    {steps.map((s) => {
                        const Icon = s.done ? Check : s.icon;
                        return (
                            <button
                                key={s.key}
                                type="button"
                                disabled={s.done}
                                onClick={() => router.push(s.href)}
                                className={`flex items-center gap-3 text-left rounded-xl border px-3 py-3 transition ${
                                    s.done
                                        ? "border-gray-100 bg-gray-50"
                                        : "border-gray-200 hover:border-[#38B2AC] hover:bg-[#F5FBFA]"
                                }`}
                            >
                                <span
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                        s.done ? "bg-[#0F766E] text-white" : "bg-[#E6FFFA] text-[#0F766E]"
                                    }`}
                                >
                                    <Icon className="w-[18px] h-[18px]" />
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span
                                        className={`block text-sm font-semibold ${
                                            s.done ? "text-gray-400 line-through" : "text-gray-800"
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                    {!s.done && <span className="block text-xs text-gray-500">{s.hint}</span>}
                                </span>
                                {!s.done && <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
