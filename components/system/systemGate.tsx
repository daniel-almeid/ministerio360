"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, CloudOff, Wrench, WifiOff, X } from "lucide-react";
import { checkSystemStatus, describeTime, NO_MAINTENANCE, type SystemStatus } from "@/lib/systemStatus";
import { decideView } from "@/lib/systemStatusView";
import { MaintenanceScreen, RetryButton, StatePill, StateScreen } from "./stateScreen";

// Fica por cima do site inteiro e mostra, quando preciso (as mesmas regras do app):
//  - manutenção (tela verde) e instabilidade do servidor (telas cheias)
//  - faixas no topo: sem internet, conexão de volta e manutenção programada

const EVERY_MS = 60000;
const MAINTENANCE_EVERY_MS = 30000;
const UNSTABLE_EVERY_MS = 20000;

// Páginas que continuam no ar mesmo durante a manutenção
const ALWAYS_OPEN = ["/termos", "/privacidade", "/confirmar", "/recursos", "/abrir-app"];
function isAlwaysOpen(path: string) {
    return path === "/" || ALWAYS_OPEN.some((p) => path === p || path.startsWith(`${p}/`));
}

function capitalize(text: string | null) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : null;
}

export function SystemGate() {
    const pathname = usePathname() ?? "/";
    const [online, setOnline] = useState(true);
    const [status, setStatus] = useState<SystemStatus>(NO_MAINTENANCE);
    const [failures, setFailures] = useState(0);
    const [reconnected, setReconnected] = useState(false);
    const [checking, setChecking] = useState(false);
    const [hideScheduled, setHideScheduled] = useState(false);
    const [countdown, setCountdown] = useState(UNSTABLE_EVERY_MS / 1000);

    const onlineRef = useRef(true);
    const busy = useRef(false);

    const check = useCallback(async () => {
        if (busy.current || !onlineRef.current) return;
        busy.current = true;
        setChecking(true);
        try {
            const result = await checkSystemStatus();
            if (result.kind === "ok") {
                setStatus(result.status);
                setFailures(0);
            } else if (onlineRef.current) {
                setFailures((n) => n + 1);
            }
        } finally {
            busy.current = false;
            setChecking(false);
        }
    }, []);

    // Internet: o navegador avisa quando cai e quando volta
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const update = () => {
            const now = navigator.onLine;
            const before = onlineRef.current;
            onlineRef.current = now;
            setOnline(now);
            if (!now) setReconnected(false);
            else if (!before) {
                setReconnected(true);
                clearTimeout(timer);
                timer = setTimeout(() => setReconnected(false), 3000);
                setFailures(0);
                check();
            }
        };
        update();
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
            clearTimeout(timer);
        };
    }, [check]);

    // Ao abrir, ao trocar de página e ao voltar para a aba
    useEffect(() => {
        check();
    }, [check, pathname]);

    useEffect(() => {
        const onVisible = () => document.visibilityState === "visible" && check();
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [check]);

    // No site a página só abre com internet, então "sem internet" vira só a faixa
    const view = decideView({ online, status, failures, loadedOnce: true });
    const blocked = isAlwaysOpen(pathname) ? "ok" : view;

    useEffect(() => {
        const every = blocked === "maintenance" ? MAINTENANCE_EVERY_MS : blocked === "unstable" ? UNSTABLE_EVERY_MS : EVERY_MS;
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") check();
        }, every);
        return () => clearInterval(timer);
    }, [blocked, check]);

    useEffect(() => {
        if (blocked !== "unstable") return;
        setCountdown(UNSTABLE_EVERY_MS / 1000);
        const t = setInterval(() => setCountdown((s) => (s <= 1 ? UNSTABLE_EVERY_MS / 1000 : s - 1)), 1000);
        return () => clearInterval(t);
    }, [blocked]);

    // A tela de manutenção/instabilidade cobre a página e trava a rolagem por baixo
    useEffect(() => {
        if (blocked !== "maintenance" && blocked !== "unstable") return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [blocked]);

    if (blocked === "maintenance") {
        return (
            <div className="fixed inset-0 z-[100] overflow-y-auto">
                <MaintenanceScreen
                    message={status.message}
                    backAt={capitalize(describeTime(status.endsAt))}
                    onCheck={check}
                    checking={checking}
                />
            </div>
        );
    }

    if (blocked === "unstable") {
        return (
            <div className="fixed inset-0 z-[100] overflow-y-auto">
                <StateScreen
                    icon={CloudOff}
                    tone="amber"
                    title="Estamos com instabilidade"
                    text="Nosso servidor não está respondendo agora. Já estamos resolvendo — seus dados estão seguros."
                    footer={<StatePill text={`Tentando de novo automaticamente em ${countdown} s`} />}
                >
                    <RetryButton onClick={check} loading={checking} />
                </StateScreen>
            </div>
        );
    }

    // Faixas (não bloqueiam a página)
    let banner: { bold: string; text: string; icon: typeof WifiOff; className: string; close?: () => void } | null = null;

    if (!online) {
        banner = {
            bold: "Sem internet.",
            text: " Você pode continuar vendo esta página; salvar só volta a funcionar com a conexão.",
            icon: WifiOff,
            className: "bg-slate-800",
        };
    } else if (reconnected) {
        banner = { bold: "Conexão de volta.", text: " Atualizando...", icon: CheckCircle2, className: "bg-emerald-700" };
    } else if (status.scheduled && !hideScheduled && !isAlwaysOpen(pathname)) {
        const when = describeTime(status.startsAt);
        banner = {
            bold: "Manutenção programada",
            text: when ? ` ${when}. O sistema fica fora do ar por alguns minutos.` : ".",
            icon: Wrench,
            className: "bg-amber-700",
            close: () => setHideScheduled(true),
        };
    }

    if (!banner) return null;
    const Icon = banner.icon;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex justify-center px-4">
            <div
                role="status"
                aria-live="polite"
                className={`pointer-events-auto flex max-w-2xl items-center gap-2.5 rounded-full px-4 py-2.5 text-[13.5px] text-white shadow-lg ${banner.className}`}
            >
                <Icon className="h-4 w-4 shrink-0" />
                <span>
                    <b className="font-semibold">{banner.bold}</b>
                    {banner.text}
                </span>
                {banner.close && (
                    <button
                        type="button"
                        onClick={banner.close}
                        aria-label="Fechar aviso"
                        className="ml-1 rounded-full p-1 hover:bg-white/15"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
