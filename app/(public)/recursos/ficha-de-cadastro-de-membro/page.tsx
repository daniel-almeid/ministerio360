import type { Metadata } from "next";
import ResourceShell from "@/components/recursos/resourceShell";
import AppCta from "@/components/recursos/appCta";
import Related from "@/components/recursos/related";
import JsonLd, { breadcrumbLd } from "@/components/recursos/jsonLd";
import { H2, P, UL } from "@/components/recursos/article";
import { SITE_URL, getResource, OG_BASE } from "@/lib/seo";
import MemberFormTool from "./memberFormTool";

const r = getResource("ficha-de-cadastro-de-membro");
const url = `/recursos/${r.slug}`;

export const metadata: Metadata = {
    title: r.title,
    description: r.description,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, url, title: r.title, description: r.description, type: "website" },
};

export default function FichaDeMembroPage() {
    return (
        <ResourceShell crumbs={[{ label: "Início", href: "/" }, { label: "Recursos", href: "/recursos" }, { label: "Ficha de membro" }]}>
            <JsonLd
                data={breadcrumbLd([
                    { name: "Início", url: `${SITE_URL}/` },
                    { name: "Recursos", url: `${SITE_URL}/recursos` },
                    { name: "Ficha de cadastro de membro", url: `${SITE_URL}${url}` },
                ])}
            />
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="print:hidden">
                    <p className="mt-6 text-sm font-semibold text-[#0F766E]">Ferramenta grátis</p>
                    <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-[#13324F] sm:text-4xl">
                        Ficha de cadastro de membro da igreja para imprimir
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#33414F]">
                        Coloque o nome da sua igreja e imprima. A ficha já vem com os campos que a secretaria mais usa e com
                        a autorização de uso dos dados, como pede a LGPD.
                    </p>
                </div>

                <MemberFormTool />

                <div className="max-w-3xl print:hidden">
                    <H2 id="o-que-perguntar">O que perguntar no cadastro</H2>
                    <P>
                        Peça só o que a igreja vai usar. Quanto menos dados, menos trabalho para manter e menos risco. Para a
                        maioria das igrejas, bastam:
                    </P>
                    <UL>
                        <li>nome, data de nascimento e contato (celular e e-mail), para aniversários e avisos;</li>
                        <li>endereço e bairro, se a igreja faz visitas ou organiza células por região;</li>
                        <li>datas de conversão e de batismo, para o histórico da vida na igreja;</li>
                        <li>em que ministério a pessoa gostaria de servir.</li>
                    </UL>
                    <P>
                        Documentos como CPF e RG só fazem sentido se a igreja realmente precisar deles. Se não houver motivo
                        claro, deixe de fora.
                    </P>

                    <H2 id="lgpd">Por que pedir a autorização de uso dos dados</H2>
                    <P>
                        A Lei Geral de Proteção de Dados (LGPD) também vale para igrejas. Dados que mostram a religião de
                        uma pessoa são considerados sensíveis, e a forma mais segura de usá-los é com a autorização dela. A
                        assinatura na ficha registra essa autorização e deixa claro para que os dados servem. Guarde as fichas
                        assinadas em local seguro.
                    </P>
                    <P>
                        Para crianças e adolescentes, a autorização precisa vir de um dos pais ou responsável.
                    </P>

                    <H2 id="depois">Depois de preencher</H2>
                    <P>
                        Ficha de papel é ótima para o dia do batismo ou da classe de novos membros, mas difícil de consultar
                        depois: aniversariantes do mês, quem serve em cada ministério, quem mudou de telefone. Passar os dados
                        para um cadastro digital resolve isso e evita perder as fichas.
                    </P>
                </div>

                <AppCta
                    title="Cadastro de membros sempre à mão"
                    text="No Ministério360, os membros ficam no celular e no computador: aniversariantes do mês, ministério de cada um, WhatsApp com um toque e importação da planilha que você já tem."
                />
                <Related current={r.slug} />
            </div>
        </ResourceShell>
    );
}
