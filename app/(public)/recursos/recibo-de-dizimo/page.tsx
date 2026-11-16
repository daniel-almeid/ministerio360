import type { Metadata } from "next";
import ResourceShell from "@/components/recursos/resourceShell";
import AppCta from "@/components/recursos/appCta";
import Related from "@/components/recursos/related";
import JsonLd, { breadcrumbLd } from "@/components/recursos/jsonLd";
import { H2, P, UL } from "@/components/recursos/article";
import { SITE_URL, getResource, OG_BASE } from "@/lib/seo";
import ReceiptTool from "./receiptTool";

const r = getResource("recibo-de-dizimo");
const url = `/recursos/${r.slug}`;

export const metadata: Metadata = {
    title: r.title,
    description: r.description,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, url, title: r.title, description: r.description, type: "website" },
};

const FAQ = [
    {
        q: "O recibo de dízimo precisa ser assinado?",
        a: "Sim. O recibo vale como comprovante quando tem a assinatura de quem recebeu pela igreja, normalmente o tesoureiro. Imprima e assine, ou assine o PDF.",
    },
    {
        q: "Posso usar o mesmo modelo para oferta e doação?",
        a: "Pode. Escolha o tipo no campo “Tipo”: dízimo, oferta, oferta de missões ou doação. O texto do recibo muda sozinho.",
    },
    {
        q: "O dízimo pode ser abatido no Imposto de Renda?",
        a: "Doações para igrejas não estão entre as deduções permitidas no Imposto de Renda de pessoa física. O recibo serve de comprovante para a igreja e para quem contribuiu. Em caso de dúvida, consulte um contador.",
    },
    {
        q: "Os dados que eu digito ficam salvos?",
        a: "Não. O recibo é montado no seu próprio navegador e nada é enviado para a internet. Ao fechar a página, os dados somem.",
    },
];

export default function ReciboDeDizimoPage() {
    return (
        <ResourceShell crumbs={[{ label: "Início", href: "/" }, { label: "Recursos", href: "/recursos" }, { label: "Recibo de dízimo" }]}>
            <JsonLd
                data={[
                    breadcrumbLd([
                        { name: "Início", url: `${SITE_URL}/` },
                        { name: "Recursos", url: `${SITE_URL}/recursos` },
                        { name: "Recibo de dízimo", url: `${SITE_URL}${url}` },
                    ]),
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
                    },
                ]}
            />
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="print:hidden">
                    <p className="mt-6 text-sm font-semibold text-[#0F766E]">Ferramenta grátis</p>
                    <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-[#13324F] sm:text-4xl">
                        Recibo de dízimo e oferta para imprimir ou salvar em PDF
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#33414F]">
                        Preencha os campos e o recibo fica pronto ao lado, com o valor por extenso. Depois é só imprimir ou
                        salvar em PDF para mandar pelo WhatsApp. Grátis e sem cadastro.
                    </p>
                </div>

                <ReceiptTool />

                <div className="max-w-3xl print:hidden">
                    <H2 id="o-que-precisa-ter">O que um recibo de dízimo precisa ter</H2>
                    <P>Um recibo simples e completo evita dúvidas na prestação de contas. Confira se o seu tem:</P>
                    <UL>
                        <li>o nome da igreja e, se tiver, o CNPJ;</li>
                        <li>o nome completo de quem contribuiu;</li>
                        <li>o valor em número e por extenso;</li>
                        <li>o tipo da contribuição (dízimo, oferta, missões ou doação);</li>
                        <li>a data e a cidade;</li>
                        <li>a assinatura de quem recebeu pela igreja.</li>
                    </UL>

                    <H2 id="quando-emitir">Quando emitir o recibo</H2>
                    <P>
                        O ideal é emitir sempre que alguém pedir e, de preferência, logo depois do culto ou da transferência.
                        Muitas igrejas também entregam no começo do ano um informe com tudo o que cada membro contribuiu no
                        ano anterior. Quem faz isso à mão costuma levar horas; num sistema, sai em segundos.
                    </P>

                    <H2 id="perguntas">Perguntas frequentes</H2>
                    <div className="mt-4 divide-y divide-[#DCEBE8] rounded-2xl bg-white ring-1 ring-[#DCEBE8]">
                        {FAQ.map((f) => (
                            <details key={f.q} className="group p-5">
                                <summary className="cursor-pointer list-none font-semibold text-[#13324F] marker:hidden">
                                    {f.q}
                                </summary>
                                <p className="mt-2 leading-relaxed text-[#33414F]">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>

                <AppCta
                    title="Recibo em PDF a cada lançamento, sem digitar de novo"
                    text="No Ministério360, a tesouraria lança o dízimo ou a oferta e gera o recibo na hora, com o nome da igreja, para enviar pelo WhatsApp. No começo do ano, o informe de cada membro sai pronto."
                />
                <Related current={r.slug} />
            </div>
        </ResourceShell>
    );
}
