import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import PrintButton from "./printButton";

export type LegalSection = { id: string; title: string; content: ReactNode };

type Props = {
    kind: "termos" | "privacidade";
    title: string;
    intro: ReactNode;
    summary: string[]; // "Em resumo" (linguagem simples, não substitui o texto)
    sections: LegalSection[];
};

// Estrutura comum de Termos de Uso e Política de Privacidade
export default function LegalDocument({ kind, title, intro, summary, sections }: Props) {
    const other =
        kind === "termos"
            ? { href: "/privacidade", label: "Política de Privacidade" }
            : { href: "/termos", label: "Termos de Uso" };

    return (
        <div className="min-h-screen bg-gray-50 print:bg-white">
            <header className="bg-white border-b border-gray-200 print:border-0">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
                    <Link href="/login" className="flex items-center" aria-label="Ministério360">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo360-cor.png" alt="Ministério360" className="h-8 w-auto" />
                    </Link>
                    <nav className="flex items-center gap-4 text-sm print:hidden">
                        <Link href={other.href} className="text-gray-600 hover:text-teal-700">
                            {other.label}
                        </Link>
                        <PrintButton />
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
                <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
                    {/* Sumário */}
                    <aside className="hidden lg:block print:hidden">
                        <nav className="sticky top-8">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Sumário</p>
                            <ol className="space-y-1.5 text-sm">
                                {sections.map((s, i) => (
                                    <li key={s.id}>
                                        <a href={`#${s.id}`} className="flex gap-2 text-gray-600 hover:text-teal-700">
                                            <span className="text-gray-400 tabular-nums w-5 shrink-0">{i + 1}.</span>
                                            <span>{s.title}</span>
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>

                    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 sm:px-10 sm:py-12 print:border-0 print:shadow-none print:p-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-teal-700">{LEGAL.PRODUCT}</p>
                        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{title}</h1>
                        <p className="mt-3 text-sm text-gray-500">
                            Última atualização: {LEGAL.UPDATED_AT} · Versão {LEGAL.VERSION}
                        </p>

                        <div className="mt-8 text-[15px] leading-7 text-gray-700 space-y-4">{intro}</div>

                        <section className="mt-8 rounded-xl border border-teal-100 bg-teal-50/60 px-5 py-4 print:border-gray-300 print:bg-white">
                            <h2 className="text-sm font-bold text-teal-800">Em resumo</h2>
                            <ul className="mt-2 space-y-1.5 text-sm text-teal-900/90 list-disc pl-5">
                                {summary.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-xs text-teal-800/70">
                                Este resumo ajuda na leitura, mas não substitui o texto completo abaixo.
                            </p>
                        </section>

                        {/* Sumário no celular */}
                        <nav className="mt-8 lg:hidden print:hidden">
                            <details className="rounded-xl border border-gray-200 px-4 py-3">
                                <summary className="cursor-pointer text-sm font-semibold text-gray-700">Sumário</summary>
                                <ol className="mt-3 space-y-1.5 text-sm">
                                    {sections.map((s, i) => (
                                        <li key={s.id}>
                                            <a href={`#${s.id}`} className="text-gray-600 hover:text-teal-700">
                                                {i + 1}. {s.title}
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </details>
                        </nav>

                        <div className="mt-10 space-y-10">
                            {sections.map((s, i) => (
                                <section key={s.id} id={s.id} className="scroll-mt-8">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        <span className="text-teal-700">{i + 1}.</span> {s.title}
                                    </h2>
                                    <div className="mt-3 text-[15px] leading-7 text-gray-700 space-y-3">{s.content}</div>
                                </section>
                            ))}
                        </div>

                        <footer className="mt-14 pt-6 border-t border-gray-200 text-sm text-gray-500 space-y-1">
                            <p>
                                {LEGAL.CONTROLLER.NAME}
                                {LEGAL.CONTROLLER.DOCUMENT && !LEGAL.CONTROLLER.DOCUMENT.startsWith("[") && ` · CNPJ ${LEGAL.CONTROLLER.DOCUMENT}`}
                                {" · "}
                                {LEGAL.CONTROLLER.LOCATION}
                            </p>
                            <p>
                                Contato:{" "}
                                <a href={`mailto:${LEGAL.EMAIL}`} className="text-teal-700 hover:underline">
                                    {LEGAL.EMAIL}
                                </a>
                            </p>
                        </footer>
                    </article>
                </div>

                <p className="mt-8 text-center text-xs text-gray-400 print:hidden">
                    <Link href="/termos" className="hover:text-teal-700">Termos de Uso</Link>
                    {"  ·  "}
                    <Link href="/privacidade" className="hover:text-teal-700">Política de Privacidade</Link>
                    {"  ·  "}
                    <Link href="/excluir-conta" className="hover:text-teal-700">Excluir conta</Link>
                </p>
            </main>
        </div>
    );
}

// Blocos de texto usados nos documentos
export function UL({ children }: { children: ReactNode }) {
    return <ul className="list-disc pl-6 space-y-1.5">{children}</ul>;
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-700">
                    <tr>
                        {head.map((h) => (
                            <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 align-top">
                    {rows.map((r, i) => (
                        <tr key={i}>
                            {r.map((c, j) => (
                                <td key={j} className="px-4 py-2.5 text-gray-700">{c}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Mail() {
    return (
        <a href={`mailto:${LEGAL.EMAIL}`} className="font-medium text-teal-700 hover:underline">
            {LEGAL.EMAIL}
        </a>
    );
}
