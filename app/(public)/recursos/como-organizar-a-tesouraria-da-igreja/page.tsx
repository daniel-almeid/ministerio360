import type { Metadata } from "next";
import Link from "next/link";
import GuidePage from "@/components/recursos/guidePage";
import { H2, H3, Note, OL, P, UL } from "@/components/recursos/article";
import { getResource, OG_BASE } from "@/lib/seo";

const r = getResource("como-organizar-a-tesouraria-da-igreja");
const url = `/recursos/${r.slug}`;

export const metadata: Metadata = {
    title: r.title,
    description: r.description,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, url, title: r.title, description: r.description, type: "article" },
};

const TOC = [
    { id: "contas", label: "Separe o dinheiro da igreja em contas" },
    { id: "categorias", label: "Defina poucas categorias e use sempre as mesmas" },
    { id: "culto", label: "Conte e registre as ofertas do culto em dupla" },
    { id: "recibos", label: "Dê recibo e guarde os comprovantes" },
    { id: "fixas", label: "Controle as contas fixas do mês" },
    { id: "prestacao", label: "Feche o mês e preste contas" },
    { id: "rotina", label: "Rotina semanal da tesouraria" },
];

export default function TesourariaPage() {
    return (
        <GuidePage
            resource={r}
            crumb="Tesouraria da igreja"
            h1="Como organizar a tesouraria da igreja"
            lead="A tesouraria cuida do que a igreja recebe e gasta e precisa prestar contas com clareza. Com algumas regras simples, que qualquer igreja consegue seguir, o trabalho fica mais leve e a confiança da membresia aumenta."
            toc={TOC}
            cta={{
                title: "A tesouraria inteira no celular",
                text: "No Ministério360 você lança entradas e saídas por categoria, separa por contas (caixa, banco), controla as contas fixas do mês, gera recibos em PDF e tira o relatório do mês pronto para a reunião.",
            }}
        >
            <H2 id="contas">1. Separe o dinheiro da igreja em contas</H2>
            <P>
                O primeiro passo é saber onde o dinheiro está. Mesmo uma igreja pequena costuma ter pelo menos dois
                lugares: o <strong>caixa</strong> (dinheiro em espécie) e a <strong>conta bancária</strong>. Registre cada
                entrada e saída na conta certa. Quando o dinheiro do caixa for depositado no banco, registre como uma
                transferência entre contas, não como saída e entrada. Assim o total da igreja não muda e o saldo de cada
                lugar fica certo.
            </P>
            <Note title="Nunca misture com o dinheiro pessoal">
                Nem por um dia. Se alguém precisar pagar uma despesa da igreja do próprio bolso, a igreja devolve o valor
                com o comprovante, e as duas coisas ficam registradas.
            </Note>

            <H2 id="categorias">2. Defina poucas categorias e use sempre as mesmas</H2>
            <P>
                Categorias são o que permite responder “quanto entrou de dízimo este mês?” ou “quanto gastamos com energia
                no ano?”. Comece com poucas:
            </P>
            <UL>
                <li><strong>Entradas:</strong> dízimo, oferta, missões, eventos, doações.</li>
                <li><strong>Saídas:</strong> aluguel, energia, água, internet, manutenção, ação social, missões, material.</li>
            </UL>
            <P>
                Evite criar uma categoria nova a cada lançamento. Se algo não se encaixa, use “outros” e revise no fim do
                mês.
            </P>

            <H2 id="culto">3. Conte e registre as ofertas do culto em dupla</H2>
            <P>A contagem do culto é o momento mais sensível. Uma regra simples protege a igreja e quem conta:</P>
            <OL>
                <li>Duas pessoas, de preferência sem parentesco, contam juntas.</li>
                <li>Separem dízimos (com nome) de ofertas (sem nome).</li>
                <li>Anotem o total numa folha de contagem, com data, culto e a assinatura das duas.</li>
                <li>Lancem o valor no mesmo dia e guardem o dinheiro em local seguro até o depósito.</li>
            </OL>

            <H2 id="recibos">4. Dê recibo e guarde os comprovantes</H2>
            <P>
                Todo dízimo com nome pode ter recibo, e muitos membros pedem. O recibo deve ter o nome da igreja, o nome de
                quem contribuiu, o valor em número e por extenso, a data e a assinatura da tesouraria. Você pode usar o
                nosso <Link href="/recursos/recibo-de-dizimo" className="font-medium text-[#0F766E] underline">modelo gratuito de recibo de dízimo</Link>.
            </P>
            <P>
                Para as saídas, guarde sempre o comprovante: nota fiscal, boleto pago ou recibo de quem prestou o serviço.
                Uma pasta por mês, física ou digital, já resolve.
            </P>

            <H2 id="fixas">5. Controle as contas fixas do mês</H2>
            <P>
                Aluguel, energia, água e internet vencem todo mês. Tenha uma lista com o valor aproximado e o dia de
                vencimento de cada uma, e marque quando pagar. Isso evita multa e mostra, logo no começo do mês, quanto já
                está comprometido.
            </P>

            <H2 id="prestacao">6. Feche o mês e preste contas</H2>
            <P>No último dia do mês (ou no primeiro do mês seguinte):</P>
            <OL>
                <li>Confira o saldo de cada conta com o extrato do banco e com o dinheiro do caixa.</li>
                <li>Veja se todos os comprovantes estão guardados.</li>
                <li>
                    Monte o resumo: total de entradas e de saídas por categoria, saldo do mês e saldo de cada conta.
                </li>
                <li>Apresente o resumo ao pastor ou ao conselho, como a igreja tiver combinado.</li>
            </OL>
            <H3>O que mostrar na prestação de contas</H3>
            <P>
                Um quadro simples basta: quanto entrou, quanto saiu, em quê, e quanto sobrou. Comparar com o mês anterior
                ajuda a perceber mudanças, como uma conta que subiu muito ou uma queda nas ofertas.
            </P>

            <H2 id="rotina">7. Rotina semanal da tesouraria</H2>
            <UL>
                <li><strong>Domingo:</strong> contagem em dupla e lançamento das ofertas e dízimos do culto.</li>
                <li><strong>Segunda:</strong> depósito do caixa e envio dos recibos pedidos.</li>
                <li><strong>Durante a semana:</strong> pagamento das contas que vencem e registro com comprovante.</li>
                <li><strong>Fim do mês:</strong> conferência, resumo e prestação de contas.</li>
            </UL>
            <P>
                Uma rotina fixa evita acumular lançamentos e faz a prestação de contas sair em minutos, não em horas.
            </P>
        </GuidePage>
    );
}
