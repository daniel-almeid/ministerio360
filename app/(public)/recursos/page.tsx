import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ClipboardList, BookOpen, ArrowRight } from "lucide-react";
import ResourceShell from "@/components/recursos/resourceShell";
import AppCta from "@/components/recursos/appCta";
import JsonLd, { breadcrumbLd } from "@/components/recursos/jsonLd";
import { RESOURCES, SITE_URL, resourceUrl, OG_BASE } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Recursos grátis para a gestão da igreja",
    description:
        "Modelos e guias gratuitos para a administração da igreja: recibo de dízimo, ficha de membro, tesouraria e escala de louvor.",
    alternates: { canonical: "/recursos" },
    openGraph: { ...OG_BASE, url: "/recursos", title: "Recursos grátis para a gestão da igreja" },
};

const ICON = { "recibo-de-dizimo": FileText, "ficha-de-cadastro-de-membro": ClipboardList } as Record<string, typeof FileText>;

export default function RecursosPage() {
    const tools = RESOURCES.filter((r) => r.kind === "ferramenta");
    const guides = RESOURCES.filter((r) => r.kind === "guia");

    return (
        <ResourceShell crumbs={[{ label: "Início", href: "/" }, { label: "Recursos" }]}>
            <JsonLd
                data={breadcrumbLd([
                    { name: "Início", url: `${SITE_URL}/` },
                    { name: "Recursos", url: `${SITE_URL}/recursos` },
                ])}
            />
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[#13324F] sm:text-5xl">
                    Recursos grátis para quem cuida da igreja
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#33414F]">
                    Modelos para usar hoje e guias práticos para a tesouraria, a secretaria e os ministérios. Sem cadastro.
                </p>

                <h2 className="mt-14 text-2xl font-semibold text-[#13324F]">Ferramentas</h2>
                <ul className="mt-5 grid gap-5 md:grid-cols-2">
                    {tools.map((r) => {
                        const Icon = ICON[r.slug] ?? FileText;
                        return (
                            <li key={r.slug}>
                                <Link
                                    href={resourceUrl(r.slug)}
                                    className="group flex h-full gap-4 rounded-3xl bg-white p-6 ring-1 ring-[#DCEBE8] transition hover:ring-[#0F766E]"
                                >
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E3F2EF] text-[#0F766E]">
                                        <Icon className="h-6 w-6" aria-hidden="true" />
                                    </span>
                                    <span>
                                        <span className="block text-lg font-semibold leading-snug text-[#13324F]">{r.title}</span>
                                        <span className="mt-1 block text-[15px] text-[#5B6B7B]">{r.card}</span>
                                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E]">
                                            Usar agora <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <h2 className="mt-14 text-2xl font-semibold text-[#13324F]">Guias</h2>
                <ul className="mt-5 grid gap-5 md:grid-cols-2">
                    {guides.map((r) => (
                        <li key={r.slug}>
                            <Link
                                href={resourceUrl(r.slug)}
                                className="group flex h-full gap-4 rounded-3xl bg-white p-6 ring-1 ring-[#DCEBE8] transition hover:ring-[#0F766E]"
                            >
                                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FFF4DB] text-[#9A6B00]">
                                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                                </span>
                                <span>
                                    <span className="block text-lg font-semibold leading-snug text-[#13324F]">{r.title}</span>
                                    <span className="mt-1 block text-[15px] text-[#5B6B7B]">{r.card}</span>
                                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E]">
                                        Ler o guia <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <AppCta
                    title="Membros, dízimos, escalas e visitantes em um só lugar"
                    text="O Ministério360 organiza a igreja no celular e no computador: recibos em PDF, escalas com confirmação pelo WhatsApp e a equipe trabalhando junto."
                />
            </div>
        </ResourceShell>
    );
}
