"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Clock, Loader2, RefreshCw, type LucideIcon } from "lucide-react";

// Telas de "algo fora do normal" do site: erro, 404, instabilidade e manutenção.
// Mesmo visual das telas do app e das telas de entrada.

const TONES = {
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-slate-100 text-slate-600",
    teal: "bg-[#E6F7F5] text-[#0F766E]",
} as const;

const RINGS = {
    red: "border-red-700",
    amber: "border-amber-700",
    gray: "border-slate-600",
    teal: "border-[#0F766E]",
} as const;

export function StateTopBar() {
    return (
        <header className="flex h-[68px] shrink-0 items-center border-b border-[#E3E8EF] px-6 sm:px-10">
            <Link href="/" className="flex items-center gap-2.5 text-[19px] font-extrabold text-[#1E3A5F]">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0F766E]">
                    <img src="/logo-branca.png" alt="" className="h-5 w-auto" />
                </span>
                <span>
                    Ministério<span className="text-[#0F766E]">360</span>
                </span>
            </Link>
        </header>
    );
}

type Props = {
    icon?: LucideIcon;
    art?: ReactNode; // no lugar do ícone (ex.: "404")
    tone: keyof typeof TONES;
    title: string;
    text: string;
    children?: ReactNode; // botões
    footer?: ReactNode;
};

export function StateScreen({ icon: Icon, art, tone, title, text, children, footer }: Props) {
    return (
        <div role="alert" className="flex min-h-screen flex-col bg-white">
            <StateTopBar />
            <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12 text-center lg:flex-row lg:gap-20 lg:text-left">
                <div className={`relative grid h-40 w-40 shrink-0 place-items-center rounded-full lg:h-[300px] lg:w-[300px] ${TONES[tone]}`}>
                    <span className={`pointer-events-none absolute -inset-4 rounded-full border-[1.5px] opacity-15 lg:-inset-7 ${RINGS[tone]}`} />
                    <span className={`pointer-events-none absolute -inset-9 hidden rounded-full border-[1.5px] opacity-[0.07] lg:block lg:-inset-14 ${RINGS[tone]}`} />
                    {art ?? (Icon && <Icon className="h-16 w-16 lg:h-28 lg:w-28" strokeWidth={1.4} />)}
                </div>
                <div className="max-w-md">
                    <h1 className="text-[26px] font-extrabold tracking-tight text-[#1E3A5F] lg:text-[34px]">{title}</h1>
                    <p className="mt-3 text-[15.5px] leading-relaxed text-gray-500 lg:text-[16.5px]">{text}</p>
                    {children && (
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">{children}</div>
                    )}
                    {footer}
                </div>
            </main>
            <footer className="flex h-14 shrink-0 items-center justify-center border-t border-[#E3E8EF] text-[13px] text-slate-400">
                © {new Date().getFullYear()} Ministério360
            </footer>
        </div>
    );
}

export const stateButton =
    "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] bg-[#0F766E] px-7 text-base font-bold text-white transition hover:bg-[#0D5C56] disabled:opacity-70";
export const stateButtonOutline =
    "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#CFE6E2] bg-white px-7 text-[15.5px] font-bold text-[#0F766E] transition hover:bg-[#F5FBFA]";

export function RetryButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
    return (
        <button type="button" onClick={onClick} disabled={loading} className={stateButton}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-[18px] w-[18px]" />}
            Tentar de novo
        </button>
    );
}

export function StatePill({ text }: { text: string }) {
    return (
        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F5F9F8] px-3 py-1.5 text-[13px] text-gray-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {text}
        </span>
    );
}

// Manutenção: fundo verde com a logo branca
export function MaintenanceScreen({
    message,
    backAt,
    onCheck,
    checking,
}: {
    message: string | null;
    backAt: string | null;
    onCheck: () => void;
    checking?: boolean;
}) {
    return (
        <div role="alert" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F766E] px-6 py-12 text-center text-white">
            <div className="pointer-events-none absolute -left-60 -top-72 h-[620px] w-[620px] rounded-full border-[1.5px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-52 -right-40 h-[460px] w-[460px] rounded-full border-[1.5px] border-white/10" />
            <div className="relative flex max-w-xl flex-col items-center">
                <img src="/logo-branca.png" alt="" className="mb-6 h-20 w-auto lg:h-24" />
                <h1 className="text-[28px] font-extrabold tracking-tight lg:text-[36px]">Estamos em manutenção</h1>
                <p className="mt-3 text-[16px] leading-relaxed text-[#CDEFEA] lg:text-[17px]">
                    {message ?? "Estamos melhorando o Ministério360 para você. Volte em alguns minutos."}
                </p>
                {backAt && (
                    <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left">
                        <Clock className="h-7 w-7" />
                        <div>
                            <p className="font-bold">Previsão de volta</p>
                            <p className="text-[14px] text-[#CDEFEA]">{backAt}</p>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={onCheck}
                    disabled={checking}
                    className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] bg-white px-8 text-base font-bold text-[#0F766E] transition hover:bg-[#F0FAF8] disabled:opacity-80"
                >
                    {checking && <Loader2 className="h-5 w-5 animate-spin" />}
                    Verificar de novo
                </button>
            </div>
        </div>
    );
}
