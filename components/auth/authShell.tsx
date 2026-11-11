"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarDays, DollarSign, Users, type LucideIcon } from "lucide-react";

// Visual comum das telas de entrada do site (Entrar, Criar conta, Recuperar senha),
// o mesmo do app: verde da marca com a logo e o formulário numa área branca.

const FEATURES: { icon: LucideIcon; text: string }[] = [
    { icon: Users, text: "Membros e visitantes organizados" },
    { icon: DollarSign, text: "Dízimos, ofertas e contas do mês" },
    { icon: CalendarDays, text: "Agenda e escalas da equipe" },
];

function Rings() {
    return (
        <>
            <div className="pointer-events-none absolute -left-56 -top-60 h-[520px] w-[520px] rounded-full border-[1.5px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-32 -right-36 h-[360px] w-[360px] rounded-full border-[1.5px] border-white/10" />
        </>
    );
}

function Brand({ size = "md" }: { size?: "md" | "lg" }) {
    return (
        <span className={`font-extrabold tracking-tight text-white ${size === "lg" ? "text-[26px]" : "text-xl"}`}>
            Ministério<span className="text-[#9EE6DD]">360</span>
        </span>
    );
}

type LayoutProps = {
    children: ReactNode;
    // Largura da coluna do formulário (o cadastro precisa de mais espaço por causa dos planos)
    width?: "sm" | "lg";
    backHref?: string;
    backLabel?: string;
};

export function AuthLayout({ children, width = "sm", backHref, backLabel = "Voltar ao login" }: LayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#0F766E] lg:flex lg:bg-white">
            {/* Computador: painel verde à esquerda */}
            <aside className="relative hidden overflow-hidden bg-[#0F766E] p-14 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[42%] lg:max-w-[560px] lg:flex-col">
                <Rings />
                <div className="relative flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                        <img src="/logo-branca.png" alt="" className="h-7 w-auto" />
                    </span>
                    <Brand />
                </div>

                <div className="relative mt-auto">
                    <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-[40px]">
                        Gestão completa para a sua igreja
                    </h2>
                    <p className="mt-3 max-w-sm text-base leading-relaxed text-[#CDEFEA]">
                        Membros, finanças, agenda e escalas no mesmo lugar, no computador e no celular.
                    </p>
                    <ul className="mt-8 space-y-3">
                        {FEATURES.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-3 text-[#E6FAF7]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                                    <Icon className="h-[18px] w-[18px]" />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Celular: topo verde com a logo */}
            <header className="relative overflow-hidden px-6 pb-16 pt-12 text-center lg:hidden">
                <div className="pointer-events-none absolute -left-32 -top-40 h-80 w-80 rounded-full border-[1.5px] border-white/10" />
                {backHref && (
                    <Link
                        href={backHref}
                        aria-label={backLabel}
                        className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                )}
                <img src="/logo-branca.png" alt="" className="mx-auto h-16 w-auto" />
                <div className="mt-2">
                    <Brand size="lg" />
                </div>
                <p className="mt-1 text-sm text-[#CDEFEA]">Gestão completa para a sua igreja</p>
            </header>

            <main className="relative -mt-7 min-h-[60vh] rounded-t-[26px] bg-white px-5 pb-10 pt-7 lg:mt-0 lg:flex lg:min-h-screen lg:flex-1 lg:items-center lg:justify-center lg:rounded-none lg:px-10 lg:py-12">
                <div className={`mx-auto w-full ${width === "lg" ? "max-w-2xl" : "max-w-[420px]"}`}>
                    {backHref && (
                        <Link
                            href={backHref}
                            className="mb-6 hidden items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline lg:inline-flex"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {backLabel}
                        </Link>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}

export function AuthTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#1E3A5F] lg:text-[28px]">{title}</h1>
            {subtitle && <p className="mt-1 text-[15px] leading-relaxed text-gray-500">{subtitle}</p>}
        </div>
    );
}

// Caixa do campo com ícone à esquerda; o campo vai dentro
export function FieldBox({ icon: Icon, invalid, children }: { icon: LucideIcon; invalid?: boolean; children: ReactNode }) {
    return (
        <div
            className={`flex min-h-[52px] items-center gap-2.5 rounded-[14px] border-[1.5px] pl-3.5 pr-1.5 transition focus-within:border-[#38B2AC] focus-within:ring-4 focus-within:ring-[#38B2AC]/15 ${
                invalid ? "border-red-300 bg-red-50" : "border-[#E3E8EF] bg-white"
            }`}
        >
            <Icon className="h-[19px] w-[19px] shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

export function AuthLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-gray-700">
            {children}
        </label>
    );
}

export function AuthError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13.5px] text-red-700">
            <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" />
            <span>{message}</span>
        </div>
    );
}

// Campo dentro do FieldBox (sem borda própria)
export const authInput =
    "w-full bg-transparent py-3 text-[15px] text-gray-900 outline-none placeholder:text-gray-400";

export const primaryButton =
    "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#0F766E] px-4 text-base font-bold text-white transition hover:bg-[#0D5C56] disabled:opacity-75";

export const outlineButton =
    "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#CFE6E2] bg-white px-4 text-[15.5px] font-bold text-[#0F766E] transition hover:bg-[#F5FBFA]";

export function Divider({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2.5 text-[13px] text-gray-500">
            <span className="h-px flex-1 bg-[#E3E8EF]" />
            {text}
            <span className="h-px flex-1 bg-[#E3E8EF]" />
        </div>
    );
}
