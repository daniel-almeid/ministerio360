import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { Mail, Table, UL, type LegalSection } from "@/components/legal/legalDocument";
import { LEGAL } from "@/lib/legal";
import { PLANS, formatBRL } from "@/lib/plans";

export const metadata: Metadata = {
    title: "Termos de Uso · Ministério360",
    description: "Regras de uso, planos, pagamentos, cancelamento e responsabilidades do Ministério360.",
};

const paidPlans = PLANS.filter((p) => p.monthlyCents > 0);

const sections: LegalSection[] = [
    {
        id: "aceitacao",
        title: "Aceitação e partes",
        content: (
            <>
                <p>
                    Estes Termos de Uso (“Termos”) regem o uso do {LEGAL.PRODUCT}, plataforma de gestão para igrejas
                    disponível no site {LEGAL.SITE} e nos aplicativos para celular (“Plataforma”), oferecida por{" "}
                    <strong>{LEGAL.CONTROLLER.NAME}</strong>
                    {!LEGAL.CONTROLLER.DOCUMENT.startsWith("[") && <>, CNPJ {LEGAL.CONTROLLER.DOCUMENT}</>}, com sede em{" "}
                    {LEGAL.CONTROLLER.LOCATION} (“nós”).
                </p>
                <p>
                    Ao criar uma conta, aceitar um convite ou usar a Plataforma, você declara que leu, entendeu e
                    concorda com estes Termos e com a{" "}
                    <Link href="/privacidade" className="text-teal-700 underline">Política de Privacidade</Link>. Se não
                    concordar, não utilize a Plataforma.
                </p>
                <p>
                    Quem cadastra uma igreja declara ter poderes para representá-la e aceitar estes Termos em nome dela.
                    A Plataforma é destinada a maiores de 18 anos.
                </p>
            </>
        ),
    },
    {
        id: "definicoes",
        title: "Definições",
        content: (
            <UL>
                <li><strong>Igreja ou Cliente:</strong> a organização cadastrada na Plataforma.</li>
                <li><strong>Titular:</strong> o Pastor que cadastrou a Igreja e responde pela conta dela, inclusive pela assinatura.</li>
                <li><strong>Usuário:</strong> qualquer pessoa com acesso à conta da Igreja — o Titular e as pessoas convidadas por um Pastor (por exemplo, outros pastores, tesoureiros, secretários e líderes).</li>
                <li><strong>Dados da Igreja:</strong> as informações inseridas pelos Usuários, como membros, visitantes, lançamentos financeiros, ministérios, eventos e escalas.</li>
                <li><strong>Plano:</strong> o conjunto de recursos e o limite de Usuários contratado (Grátis, Padrão, Premium ou Premium+).</li>
            </UL>
        ),
    },
    {
        id: "servico",
        title: "O serviço",
        content: (
            <>
                <p>
                    A Plataforma oferece ferramentas para a organização da Igreja, como cadastro de membros e
                    visitantes, controle financeiro, ministérios, agenda, escalas com confirmação de presença,
                    relatórios e gestão de Usuários com permissões. Os recursos disponíveis variam conforme o Plano.
                </p>
                <p>
                    Podemos melhorar, alterar ou descontinuar recursos para evoluir o serviço, sempre preservando o
                    acesso aos Dados da Igreja. Mudanças que reduzam de forma relevante os recursos de um Plano pago
                    serão comunicadas com antecedência.
                </p>
            </>
        ),
    },
    {
        id: "contas",
        title: "Cadastro, contas e acessos",
        content: (
            <UL>
                <li>As informações de cadastro devem ser verdadeiras e mantidas atualizadas.</li>
                <li>O acesso é pessoal: cada pessoa deve ter o seu próprio login. Não compartilhe sua senha.</li>
                <li>
                    Os Pastores da Igreja definem quem é convidado e quais permissões cada Usuário tem (ver, editar ou
                    nenhum acesso, por área). A Igreja responde pelos atos praticados pelos Usuários que convidou.
                </li>
                <li>
                    Avise-nos imediatamente em caso de suspeita de uso indevido da conta pelo e-mail <Mail />.
                </li>
                <li>
                    O número de Usuários (contando convites pendentes) é limitado pelo Plano contratado.
                </li>
            </UL>
        ),
    },
    {
        id: "planos",
        title: "Planos, preços e pagamento",
        content: (
            <>
                <p>Os Planos pagos e seus preços atuais são:</p>
                <Table
                    head={["Plano", "Mensal", "Anual", "Usuários"]}
                    rows={paidPlans.map((p) => [
                        <strong key="n">{p.name}</strong>,
                        `${formatBRL(p.monthlyCents)}/mês`,
                        `${formatBRL(p.yearlyCents)}/ano`,
                        p.users === null ? "Ilimitados" : `Até ${p.users}`,
                    ])}
                />
                <UL>
                    <li>O Plano Grátis não tem cobrança e permite 1 Usuário, com recursos limitados.</li>
                    <li>
                        O Plano anual custa o equivalente a 10 mensalidades e pode ser pago à vista ou parcelado em
                        até 12 vezes no cartão de crédito. O Plano mensal é cobrado à vista, todo mês.
                    </li>
                    <li>
                        Os pagamentos são processados pelo <strong>Pagar.me</strong>. Os dados do cartão são enviados
                        diretamente a ele; nós não armazenamos o número do cartão.
                    </li>
                    <li>
                        <strong>Renovação automática:</strong> a assinatura é renovada e cobrada automaticamente ao fim
                        de cada ciclo (mensal ou anual), no mesmo cartão, até ser cancelada.
                    </li>
                    <li>
                        <strong>Pagamento não aprovado:</strong> o Pagar.me pode tentar a cobrança novamente. Se o
                        pagamento não for confirmado em até 1 dia após o vencimento, a Igreja passa automaticamente
                        para o Plano Grátis. Nenhum dado é apagado por isso, e o Plano volta assim que o pagamento for
                        confirmado.
                    </li>
                    <li>
                        <strong>Troca de Plano ou de ciclo:</strong> a nova assinatura começa na data da troca, com um
                        período completo, e a assinatura anterior é encerrada, sem reembolso proporcional do período
                        não utilizado.
                    </li>
                    <li>
                        Novos preços valem para as renovações seguintes e serão comunicados com pelo menos 30 dias de
                        antecedência, para que você possa cancelar, se preferir.
                    </li>
                </UL>
            </>
        ),
    },
    {
        id: "cancelamento",
        title: "Cancelamento, arrependimento e reembolso",
        content: (
            <>
                <UL>
                    <li>
                        <strong>Cancelar a qualquer momento:</strong> um Pastor da Igreja pode cancelar a renovação
                        automática em <em>Planos › Minha assinatura</em>, no site ou no aplicativo. Nada mais será
                        cobrado.
                    </li>
                    <li>
                        Após o cancelamento, a Igreja continua com todos os recursos do Plano até o fim do período já
                        pago e, depois, passa para o Plano Grátis, sem perda de dados.
                    </li>
                    <li>
                        <strong>Direito de arrependimento:</strong> na primeira contratação de um Plano pago, você pode
                        desistir em até <strong>7 (sete) dias</strong> e receber o reembolso integral do valor pago,
                        conforme o art. 49 do Código de Defesa do Consumidor. Para isso, cancele a assinatura e envie o
                        pedido para <Mail />. O estorno é feito no mesmo cartão, no prazo da operadora.
                    </li>
                    <li>
                        Fora do prazo de arrependimento, valores já pagos — inclusive de Planos anuais — não são
                        reembolsados, total ou proporcionalmente, ressalvadas as hipóteses previstas em lei.
                    </li>
                </UL>
            </>
        ),
    },
    {
        id: "uso",
        title: "Uso aceitável",
        content: (
            <>
                <p>Ao usar a Plataforma, você se compromete a não:</p>
                <UL>
                    <li>usá-la para qualquer finalidade ilegal ou que viole direitos de terceiros;</li>
                    <li>cadastrar dados de pessoas sem uma base legal adequada ou contra a vontade delas;</li>
                    <li>enviar mensagens em massa não solicitadas (spam) a partir dos recursos de compartilhamento;</li>
                    <li>tentar acessar dados de outras igrejas, contornar permissões ou explorar falhas de segurança;</li>
                    <li>copiar, modificar, revender ou fazer engenharia reversa da Plataforma;</li>
                    <li>sobrecarregar ou prejudicar o funcionamento do serviço.</li>
                </UL>
            </>
        ),
    },
    {
        id: "dados-igreja",
        title: "Dados da Igreja e proteção de dados",
        content: (
            <>
                <p>
                    Os Dados da Igreja pertencem à Igreja. Em relação a eles, a Igreja é a <strong>controladora</strong>{" "}
                    e nós atuamos como <strong>operadores</strong>, tratando os dados apenas para prestar o serviço,
                    conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).
                </p>
                <p>Cabe à Igreja:</p>
                <UL>
                    <li>ter base legal para cadastrar os dados de membros, visitantes e demais pessoas;</li>
                    <li>
                        observar que a ligação de uma pessoa com uma igreja pode revelar convicção religiosa, que é um
                        dado pessoal sensível (art. 11 da LGPD);
                    </li>
                    <li>
                        obter o consentimento de um dos pais ou responsável antes de cadastrar dados de crianças e
                        adolescentes (art. 14 da LGPD);
                    </li>
                    <li>manter os dados corretos e atender às solicitações das pessoas cadastradas.</li>
                </UL>
                <p>
                    O tratamento dos dados das contas e o uso que fazemos das informações estão descritos na{" "}
                    <Link href="/privacidade" className="text-teal-700 underline">Política de Privacidade</Link>.
                </p>
            </>
        ),
    },
    {
        id: "retencao",
        title: "Registros removidos automaticamente",
        content: (
            <p>
                Para manter a agenda e as escalas organizadas, <strong>eventos e escalas com data anterior ao dia
                atual são excluídos automaticamente</strong>, junto com as confirmações de presença das escalas. Se
                precisar guardar esse histórico, gere os relatórios antes da data.
            </p>
        ),
    },
    {
        id: "propriedade",
        title: "Propriedade intelectual",
        content: (
            <p>
                O software, a marca {LEGAL.PRODUCT}, o layout e os conteúdos da Plataforma são protegidos por lei e
                pertencem a {LEGAL.CONTROLLER.NAME}. Concedemos à Igreja uma licença de uso pessoal, limitada, não
                exclusiva e intransferível, enquanto a conta estiver ativa. Nada nestes Termos transfere a você
                direitos sobre a Plataforma.
            </p>
        ),
    },
    {
        id: "disponibilidade",
        title: "Disponibilidade e suporte",
        content: (
            <UL>
                <li>
                    Trabalhamos para manter a Plataforma disponível e segura, mas ela pode ficar indisponível por
                    manutenção, atualizações ou falhas de terceiros (como internet, hospedagem e processadores de
                    pagamento). Manutenções planejadas serão feitas preferencialmente em horários de menor uso.
                </li>
                <li>
                    O suporte é prestado pelo e-mail <Mail />. No Plano Premium+ o atendimento é prioritário.
                </li>
            </UL>
        ),
    },
    {
        id: "responsabilidade",
        title: "Limitação de responsabilidade",
        content: (
            <>
                <p>Na máxima extensão permitida pela lei, e ressalvados os direitos do consumidor, não respondemos por:</p>
                <UL>
                    <li>informações inseridas pelos Usuários e decisões tomadas com base nelas;</li>
                    <li>uso indevido da conta por Usuários convidados ou por quem teve acesso às credenciais;</li>
                    <li>falhas de serviços de terceiros, como operadoras de internet, Pagar.me, WhatsApp e lojas de aplicativos;</li>
                    <li>lucros cessantes e danos indiretos.</li>
                </UL>
                <p>
                    Quando a Igreja contratar a Plataforma como pessoa jurídica para sua atividade, nossa
                    responsabilidade total fica limitada ao valor pago por ela nos 12 meses anteriores ao evento.
                </p>
            </>
        ),
    },
    {
        id: "encerramento",
        title: "Suspensão e exclusão de conta",
        content: (
            <>
                <p>
                    Podemos suspender ou encerrar o acesso em caso de violação destes Termos, fraude ou exigência legal,
                    com aviso prévio sempre que possível.
                </p>
                <p>
                    Qualquer Usuário pode excluir a própria conta a qualquer momento, pelo menu do perfil no
                    aplicativo ou pela página{" "}
                    <Link href="/excluir-conta" className="text-teal-700 underline">Excluir conta</Link>. Antes da
                    confirmação, a Plataforma informa exatamente o que vai acontecer:
                </p>
                <UL>
                    <li><strong>Usuário convidado:</strong> somente a conta dele é excluída; a Igreja continua.</li>
                    <li>
                        <strong>Titular, havendo outro Pastor ativo:</strong> a Igreja e todos os dados passam para esse
                        Pastor, e somente a conta do Titular é excluída.
                    </li>
                    <li>
                        <strong>Titular sem outro Pastor ativo:</strong> a assinatura é cancelada e a Igreja, todos os
                        Dados da Igreja e as contas dos demais Usuários são excluídos definitivamente.
                    </li>
                </UL>
            </>
        ),
    },
    {
        id: "comunicacoes",
        title: "Comunicações",
        content: (
            <p>
                Podemos enviar mensagens sobre a conta, a assinatura, segurança e mudanças relevantes para o e-mail
                cadastrado. O aplicativo pode exibir lembretes no próprio aparelho, que o Usuário pode ligar ou
                desligar a qualquer momento.
            </p>
        ),
    },
    {
        id: "alteracoes",
        title: "Alterações destes Termos",
        content: (
            <p>
                Podemos atualizar estes Termos. A data e a versão ficam sempre no topo desta página. Mudanças
                relevantes serão comunicadas com antecedência razoável e, quando necessário, pediremos um novo aceite.
                Se você não concordar, poderá cancelar a assinatura e excluir a conta.
            </p>
        ),
    },
    {
        id: "geral",
        title: "Disposições gerais e foro",
        content: (
            <UL>
                <li>Estes Termos são regidos pelas leis da República Federativa do Brasil.</li>
                <li>
                    Fica eleito o foro do domicílio do Cliente para resolver qualquer questão relacionada a estes
                    Termos.
                </li>
                <li>
                    Se alguma cláusula for considerada inválida, as demais continuam valendo. A tolerância com o
                    descumprimento de qualquer regra não significa renúncia a ela.
                </li>
            </UL>
        ),
    },
    {
        id: "contato",
        title: "Contato",
        content: (
            <p>
                Dúvidas, pedidos de reembolso por arrependimento e suporte: <Mail />.
            </p>
        ),
    },
];

export default function TermosPage() {
    return (
        <LegalDocument
            kind="termos"
            title="Termos de Uso"
            intro={
                <p>
                    Bem-vindo(a) ao {LEGAL.PRODUCT}. Estes Termos explicam as regras para usar a Plataforma, como
                    funcionam os planos e pagamentos e quais são os direitos e deveres de cada parte. Leia com atenção.
                </p>
            }
            summary={[
                "Quem cadastra a igreja responde por ela e pelos usuários que convidar.",
                "Planos pagos renovam sozinhos, todo mês ou todo ano, até você cancelar.",
                "Você pode cancelar a qualquer momento: o plano continua até o fim do período já pago.",
                "Na primeira contratação, você pode desistir em até 7 dias com reembolso integral.",
                "Os dados da igreja são da igreja; você pode excluir sua conta quando quiser.",
                "Eventos e escalas de datas passadas são removidos automaticamente.",
            ]}
            sections={sections}
        />
    );
}
