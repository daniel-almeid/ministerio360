import ResourceShell from "@/components/recursos/resourceShell";
import AppCta from "@/components/recursos/appCta";
import Related from "@/components/recursos/related";
import JsonLd, { breadcrumbLd } from "@/components/recursos/jsonLd";
import { Lead, Toc } from "@/components/recursos/article";
import { SITE_URL, type Resource } from "@/lib/seo";

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
function longDate(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

type Props = {
    resource: Resource;
    crumb: string;
    h1: string;
    lead: React.ReactNode;
    toc: { id: string; label: string }[];
    cta: { title: string; text: string };
    children: React.ReactNode;
};

// Moldura comum dos guias: título, índice, texto, chamada para o app e "veja também"
export default function GuidePage({ resource: r, crumb, h1, lead, toc, cta, children }: Props) {
    const url = `${SITE_URL}/recursos/${r.slug}`;
    return (
        <ResourceShell crumbs={[{ label: "Início", href: "/" }, { label: "Recursos", href: "/recursos" }, { label: crumb }]}>
            <JsonLd
                data={[
                    breadcrumbLd([
                        { name: "Início", url: `${SITE_URL}/` },
                        { name: "Recursos", url: `${SITE_URL}/recursos` },
                        { name: crumb, url },
                    ]),
                    {
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: r.title,
                        description: r.description,
                        datePublished: r.updated,
                        dateModified: r.updated,
                        inLanguage: "pt-BR",
                        mainEntityOfPage: url,
                        author: { "@type": "Organization", name: "Ministério360", url: SITE_URL },
                        publisher: { "@type": "Organization", name: "Ministério360", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo360-cor.png` } },
                    },
                ]}
            />
            <article className="mx-auto max-w-3xl px-4 sm:px-6">
                <p className="mt-6 text-sm font-semibold text-[#0F766E]">Guia · atualizado em {longDate(r.updated)}</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-[#13324F] sm:text-4xl">{h1}</h1>
                <Lead>{lead}</Lead>
                <Toc items={toc} />
                {children}
            </article>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <AppCta title={cta.title} text={cta.text} />
                <Related current={r.slug} />
            </div>
        </ResourceShell>
    );
}
