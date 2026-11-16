import type { Metadata } from "next";
import GuidePage from "@/components/recursos/guidePage";
import { H2, H3, Note, OL, P, UL } from "@/components/recursos/article";
import { getResource, OG_BASE } from "@/lib/seo";

const r = getResource("escala-de-louvor");
const url = `/recursos/${r.slug}`;

export const metadata: Metadata = {
    title: r.title,
    description: r.description,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, url, title: r.title, description: r.description, type: "article" },
};

const TOC = [
    { id: "base", label: "Comece pela lista de quem serve e em quê" },
    { id: "disponibilidade", label: "Pergunte a disponibilidade antes de montar" },
    { id: "montar", label: "Monte a escala com rodízio justo" },
    { id: "conflitos", label: "Evite os conflitos mais comuns" },
    { id: "confirmacao", label: "Peça confirmação com prazo" },
    { id: "substituicoes", label: "Tenha um plano para substituições" },
    { id: "modelo", label: "Exemplo de escala mensal" },
];

export default function EscalaDeLouvorPage() {
    return (
        <GuidePage
            resource={r}
            crumb="Escala de louvor"
            h1="Como fazer a escala do louvor sem conflito"
            lead="Escala boa é a que todo mundo conhece com antecedência, divide o serviço de forma justa e tem resposta rápida quando alguém não pode. As dicas abaixo servem para o louvor e também para mídia, recepção, infantil e qualquer outro ministério."
            toc={TOC}
            cta={{
                title: "Escala pronta e confirmada pelo WhatsApp",
                text: "No Ministério360 você monta a escala por ministério, cada voluntário recebe um link no WhatsApp para confirmar presença, e o líder vê quem confirmou e manda lembrete para quem falta.",
            }}
        >
            <H2 id="base">1. Comece pela lista de quem serve e em quê</H2>
            <P>
                Antes da escala, tenha uma lista atualizada do ministério: nome, contato e função de cada pessoa (vocal,
                violão, teclado, bateria, baixo, som, projeção). Anote também quem está em treinamento e quem pode cobrir
                mais de uma função. Essa lista é a base de tudo e evita esquecer alguém.
            </P>

            <H2 id="disponibilidade">2. Pergunte a disponibilidade antes de montar</H2>
            <P>
                Uns dez dias antes do mês começar, peça para cada um avisar as datas em que não pode servir: viagem,
                plantão, prova, aniversário na família. É muito mais fácil montar a escala já sabendo as ausências do que
                corrigir depois.
            </P>

            <H2 id="montar">3. Monte a escala com rodízio justo</H2>
            <UL>
                <li>
                    <strong>Distribua por igual:</strong> ninguém deve servir em todos os cultos enquanto outros servem uma
                    vez por mês. Conte quantas vezes cada pessoa foi escalada.
                </li>
                <li>
                    <strong>Garanta as funções essenciais:</strong> em cada culto, confira se há quem cubra cada função que
                    não pode faltar (por exemplo, quem dirige, um instrumento base e o som).
                </li>
                <li>
                    <strong>Misture experientes e iniciantes:</strong> quem está aprendendo cresce servindo ao lado de quem
                    tem mais tempo.
                </li>
                <li>
                    <strong>Respeite o descanso:</strong> evite escalar a mesma pessoa em dois cultos seguidos no mesmo dia,
                    a não ser que ela queira.
                </li>
            </UL>

            <H2 id="conflitos">4. Evite os conflitos mais comuns</H2>
            <H3>A mesma pessoa em dois ministérios no mesmo horário</H3>
            <P>
                Acontece muito com quem toca no louvor e também ajuda na mídia ou no infantil. Combine com os outros
                líderes e confira as escalas dos ministérios lado a lado antes de publicar.
            </P>
            <H3>Escala mudada em cima da hora</H3>
            <P>
                Publique a escala do mês inteiro com pelo menos uma semana de antecedência e evite mexer depois, a não ser
                por substituição. Mudanças constantes fazem as pessoas pararem de olhar a escala.
            </P>
            <H3>Ninguém sabe se a pessoa vem</H3>
            <P>É o conflito mais comum, e se resolve com confirmação de presença, que é o próximo passo.</P>

            <H2 id="confirmacao">5. Peça confirmação com prazo</H2>
            <P>
                Mandar a escala no grupo não garante que todos viram. Peça para cada pessoa confirmar a presença até uma
                data, por exemplo até quarta-feira para o culto de domingo. Assim o líder sabe com antecedência quem vem
                e tem tempo de achar substituto.
            </P>
            <Note title="Lembrete na véspera">
                Um dia antes do prazo, mande um lembrete só para quem ainda não confirmou. É mais eficiente do que lembrar o
                grupo inteiro.
            </Note>

            <H2 id="substituicoes">6. Tenha um plano para substituições</H2>
            <OL>
                <li>Quem não puder servir avisa o líder o quanto antes, não só no grupo.</li>
                <li>Se possível, a própria pessoa sugere um substituto da mesma função.</li>
                <li>O líder confirma a troca e atualiza a escala para todos verem a versão certa.</li>
            </OL>
            <P>Ter dois ou três nomes de reserva por função deixa as trocas muito mais rápidas.</P>

            <H2 id="modelo">7. Exemplo de escala mensal</H2>
            <P>Um formato simples, com uma linha por culto e uma coluna por função, funciona bem:</P>
            <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-[#DCEBE8]">
                <table className="w-full min-w-[520px] text-left text-[14px]">
                    <thead className="bg-[#E3F2EF] text-[#13324F]">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Culto</th>
                            <th className="px-4 py-3 font-semibold">Dirige</th>
                            <th className="px-4 py-3 font-semibold">Vocal</th>
                            <th className="px-4 py-3 font-semibold">Instrumentos</th>
                            <th className="px-4 py-3 font-semibold">Som</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCEBE8] text-[#33414F]">
                        <tr><td className="px-4 py-3">Domingo 1 · 18h</td><td className="px-4 py-3">Ana</td><td className="px-4 py-3">Lucas, Bia</td><td className="px-4 py-3">Pedro (violão), Rui (bateria)</td><td className="px-4 py-3">Marcos</td></tr>
                        <tr><td className="px-4 py-3">Domingo 2 · 18h</td><td className="px-4 py-3">Lucas</td><td className="px-4 py-3">Carla, Davi</td><td className="px-4 py-3">Júlia (teclado), Rui (bateria)</td><td className="px-4 py-3">Tiago</td></tr>
                        <tr><td className="px-4 py-3">Domingo 3 · 18h</td><td className="px-4 py-3">Carla</td><td className="px-4 py-3">Ana, Bia</td><td className="px-4 py-3">Pedro (violão), Léo (bateria)</td><td className="px-4 py-3">Marcos</td></tr>
                        <tr><td className="px-4 py-3">Domingo 4 · 18h</td><td className="px-4 py-3">Ana</td><td className="px-4 py-3">Davi, Carla</td><td className="px-4 py-3">Júlia (teclado), Léo (bateria)</td><td className="px-4 py-3">Tiago</td></tr>
                    </tbody>
                </table>
            </div>
            <P>
                Repare que ninguém aparece em todos os domingos e que cada culto tem quem dirige, vozes, instrumentos e som.
            </P>
        </GuidePage>
    );
}
