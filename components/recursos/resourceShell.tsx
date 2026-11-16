import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/site";

export type Crumb = { label: string; href?: string };

// Moldura das páginas de Recursos: topo igual ao da página inicial, trilha de navegação e rodapé
export default function ResourceShell({ crumbs, children }: { crumbs: Crumb[]; children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F7FBFA] font-sans text-[#1B2430] antialiased">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#13324F]/95 backdrop-blur print:hidden">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-white">
                        <Image src="/logo360.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
                        <span className="hidden text-lg font-semibold text-white min-[370px]:inline">Ministério360</span>
                    </Link>
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <Link href="/recursos" className="hidden rounded-full px-3 py-2 text-sm font-medium text-white/80 hover:text-white sm:inline-block">
                            Recursos
                        </Link>
                        <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-white/90 hover:text-white">
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#13324F] hover:bg-[#E3F2EF]"
                        >
                            Criar conta
                        </Link>
                    </nav>
                </div>
            </header>

            <nav aria-label="Trilha" className="mx-auto max-w-6xl px-4 pt-6 text-sm text-[#5B6B7B] sm:px-6 print:hidden">
                <ol className="flex flex-wrap items-center gap-1.5">
                    {crumbs.map((c, i) => (
                        <li key={c.label} className="flex items-center gap-1.5">
                            {i > 0 && <span aria-hidden="true">›</span>}
                            {c.href ? (
                                <Link href={c.href} className="hover:text-[#0F766E] hover:underline">
                                    {c.label}
                                </Link>
                            ) : (
                                <span className="text-[#13324F]">{c.label}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            <main>{children}</main>

            <footer className="mt-20 bg-[#0B2238] text-white/70 print:hidden">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="flex items-center gap-2">
                        <Shield aria-hidden="true" className="h-4 w-4" />
                        Ministério360 · gestão para igrejas
                    </p>
                    <nav className="flex flex-wrap gap-x-6 gap-y-2">
                        <Link href="/recursos" className="hover:text-white">Recursos grátis</Link>
                        <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
                        <Link href="/privacidade" className="hover:text-white">Política de Privacidade</Link>
                        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">Contato</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
