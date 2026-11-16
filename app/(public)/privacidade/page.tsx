import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { Mail, Table, UL, type LegalSection } from "@/components/legal/legalDocument";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
    title: "Política de Privacidade",
    alternates: { canonical: "/privacidade" },
    description: "Como o Ministério360 trata dados pessoais, conforme a LGPD.",
};

const sections: LegalSection[] = [
    {
        id: "quem-somos",
        title: "Quem somos",
        content: (
            <>
                <p>
                    O {LEGAL.PRODUCT} é oferecido por <strong>{LEGAL.CONTROLLER.NAME}</strong>
                    {!LEGAL.CONTROLLER.DOCUMENT.startsWith("[") && <>, CNPJ {LEGAL.CONTROLLER.DOCUMENT}</>}, com sede em{" "}
                    {LEGAL.CONTROLLER.LOCATION} (“nós”).
                </p>
                <p>
                    Encarregado pelo tratamento de dados pessoais (art. 41 da LGPD): <strong>{LEGAL.DPO_NAME}</strong>,
                    pelo e-mail <Mail />.
                </p>
            </>
        ),
    },
    {
        id: "papeis",
        title: "Nosso papel e o papel da igreja",
        content: (
            <>
                <p>A LGPD diferencia quem decide sobre os dados (controlador) de quem os trata em nome dele (operador):</p>
                <UL>
                    <li>
                        <strong>Somos controladores</strong> dos dados das contas de acesso (nome, e-mail, senha), da
                        igreja como cliente e da cobrança.
                    </li>
                    <li>
                        <strong>A igreja é controladora</strong> dos dados que ela cadastra — membros, visitantes,
                        crianças do Ministério Infantil, lançamentos financeiros, escalas e afins. Nesse caso, somos <strong>operadores</strong>: tratamos
                        esses dados somente para prestar o serviço à igreja e seguindo as instruções dela.
                    </li>
                </UL>
                <p>
                    Se você é membro ou visitante de uma igreja que usa o {LEGAL.PRODUCT}, faça seus pedidos sobre os
                    seus dados diretamente à igreja. Se preferir, escreva para <Mail /> e encaminharemos o pedido.
                </p>
            </>
        ),
    },
    {
        id: "dados",
        title: "Quais dados tratamos",
        content: (
            <>
                <Table
                    head={["Categoria", "Dados", "Origem"]}
                    rows={[
                        [
                            <strong key="a">Conta de acesso</strong>,
                            "Nome, e-mail, senha (guardada de forma criptografada, sem possibilidade de leitura), função na igreja, permissões e ministérios vinculados, data e versão do aceite destes documentos.",
                            "Você ou o Pastor que enviou o convite",
                        ],
                        [
                            <strong key="b">Igreja</strong>,
                            "Nome, razão social, CNPJ, data de fundação, denominação, endereço, telefone, e-mail, site e redes sociais.",
                            "Usuários da igreja",
                        ],
                        [
                            <strong key="c">Cadastros da igreja</strong>,
                            "Membros (nome, telefone, e-mail, data de nascimento, ministério, situação); visitantes (nome, telefone, e-mail, data da visita, acompanhamento e observações); lançamentos financeiros, inclusive dízimos e ofertas vinculados a um membro; ministérios, eventos e escalas, com as respostas de confirmação de presença.",
                            "Usuários da igreja",
                        ],
                        [
                            <strong key="i">Ministério Infantil</strong>,
                            "Crianças: nome, data de nascimento e turma. Responsáveis (sempre membros da igreja): vínculo com a criança e parentesco. Registro da autorização: quem a confirmou e quando. Não há campos para dados de saúde, fotos ou documentos.",
                            "Usuários da igreja, com autorização de um dos pais ou responsável",
                        ],
                        [
                            <strong key="d">Pagamento</strong>,
                            "Plano, ciclo, validade e identificadores da assinatura. Os dados do cartão, CPF ou CNPJ, telefone e endereço de cobrança são enviados diretamente ao Pagar.me; não armazenamos o número do cartão. Nas assinaturas feitas pelo aplicativo, o pagamento é processado pelo Google Play; recebemos apenas a confirmação, o plano e a validade da assinatura.",
                            "Titular da igreja",
                        ],
                        [
                            <strong key="e">Uso e segurança</strong>,
                            "Endereço IP, data e hora de acesso, tipo de dispositivo e navegador, registros técnicos de erros e de autenticação.",
                            "Gerados automaticamente pelo uso",
                        ],
                        [
                            <strong key="f">Diagnóstico e estatística de uso</strong>,
                            "Relatórios de falhas do aplicativo (tipo do erro, tela, versão do app, modelo e sistema do aparelho) e estatísticas de uso do aplicativo e do site: telas e páginas abertas, ações feitas (por exemplo, “membro cadastrado” ou “recibo gerado”), plano da igreja e papel do usuário. Não incluem nome, e-mail, telefone, localização, valores nem o conteúdo dos cadastros. Na área logada, ficam ligadas apenas ao código interno da igreja, não ao nome dela nem à pessoa; fora dela, a um código aleatório que vale só para aquela visita.",
                            "Gerados automaticamente pelo uso do aplicativo e do site",
                        ],
                    ]}
                />
                <p>
                    <strong>Dados sensíveis.</strong> A ligação de uma pessoa com uma igreja pode revelar convicção
                    religiosa, que a LGPD considera dado sensível (art. 5º, II). Esses dados são tratados com cuidado
                    redobrado, apenas para as finalidades do serviço e com isolamento total entre igrejas.
                </p>
                <p>
                    <strong>Crianças e adolescentes.</strong> A igreja decide quem usa a Plataforma, inclusive jovens
                    menores de 18 anos que trabalham com ela. Ao liberar o acesso a um menor, cabe à igreja obter a
                    autorização de um dos pais ou responsável quando a lei exigir e escolher a quais áreas ele terá
                    acesso. Quando a igreja cadastra dados de crianças ou adolescentes, cabe a ela obter o consentimento
                    de um dos pais ou responsável (art. 14 da LGPD).
                </p>
                <p>
                    No <strong>Ministério Infantil</strong>, a igreja pode cadastrar crianças e adolescentes para
                    organizar as turmas e falar com os responsáveis. Para isso:
                </p>
                <UL>
                    <li>cada cadastro tem pelo menos um responsável, que precisa ser membro da igreja;</li>
                    <li>
                        antes de salvar, a igreja confirma que um dos pais ou responsável autorizou o cadastro. O
                        sistema registra quem confirmou e quando, e oferece um modelo de autorização para imprimir e
                        assinar;
                    </li>
                    <li>
                        são guardados apenas o nome, a data de nascimento, a turma e os responsáveis. Não há campos
                        para dados de saúde, fotos ou documentos;
                    </li>
                    <li>somente os usuários a quem o Pastor dá acesso ao Ministério Infantil veem esses dados;</li>
                    <li>
                        os dados são usados apenas para organizar o ministério e para a igreja falar com os
                        responsáveis, sempre no melhor interesse da criança (art. 14 da LGPD).
                    </li>
                </UL>
                <p>Os dados das crianças são da igreja, que é a controladora; nós atuamos como operadores.</p>
            </>
        ),
    },
    {
        id: "finalidades",
        title: "Para que usamos os dados e com qual base legal",
        content: (
            <>
                <Table
                    head={["Finalidade", "Base legal (LGPD)"]}
                    rows={[
                        ["Criar e manter a conta, permitir o acesso e prestar o serviço contratado", "Execução de contrato (art. 7º, V)"],
                        ["Processar a assinatura, cobranças, renovações e cancelamentos", "Execução de contrato (art. 7º, V)"],
                        ["Guardar registros de acesso e cumprir obrigações fiscais e legais", "Cumprimento de obrigação legal (art. 7º, II)"],
                        ["Proteger a Plataforma, prevenir fraudes e acessos indevidos", "Legítimo interesse (art. 7º, IX) e prevenção à fraude (art. 11, II, g)"],
                        ["Atender solicitações de suporte e enviar avisos sobre a conta", "Execução de contrato (art. 7º, V)"],
                        ["Corrigir falhas e entender quais recursos do aplicativo e do site são usados, para melhorá-los", "Legítimo interesse (art. 7º, IX), com dados que não identificam a pessoa"],
                        ["Defender direitos em processos judiciais ou administrativos", "Exercício regular de direitos (art. 7º, VI)"],
                        ["Organizar o Ministério Infantil da igreja (turmas, responsáveis e contato)", "Consentimento específico de um dos pais ou responsável, obtido pela igreja (art. 14, §1º)"],
                        ["Tratar os cadastros feitos pela igreja", "Base legal definida pela igreja, como controladora"],
                    ]}
                />
                <p>
                    Não vendemos dados pessoais, não os usamos para publicidade e não fazemos perfis de comportamento.
                </p>
            </>
        ),
    },
    {
        id: "compartilhamento",
        title: "Com quem compartilhamos",
        content: (
            <>
                <p>Compartilhamos dados apenas com fornecedores necessários para o funcionamento do serviço:</p>
                <Table
                    head={["Fornecedor", "Para quê"]}
                    rows={[
                        [<strong key="a">Supabase</strong>, "Banco de dados, autenticação e armazenamento"],
                        [<strong key="b">Vercel</strong>, "Hospedagem do site e dos serviços da Plataforma"],
                        [<strong key="c">Pagar.me</strong>, "Processamento de pagamentos e assinaturas"],
                        [<strong key="d">Expo (EAS)</strong>, "Distribuição e atualização do aplicativo"],
                        [<strong key="e">Google Play e App Store</strong>, "Download e instalação do aplicativo e pagamento das assinaturas feitas por ele, conforme as políticas de cada loja"],
                        [<strong key="f">RevenueCat</strong>, "Controle das assinaturas feitas pelo aplicativo (plano e validade)"],
                        [<strong key="g">Sentry</strong>, "Relatórios de falhas do aplicativo, sem dados que identifiquem a pessoa"],
                        [<strong key="h">PostHog</strong>, "Estatísticas de uso do aplicativo e do site, sem dados que identifiquem a pessoa"],
                    ]}
                />
                <p>
                    Quando um Usuário escolhe compartilhar uma mensagem pelo WhatsApp (por exemplo, uma escala ou um
                    convite), o aplicativo apenas abre o WhatsApp com o texto preparado; o envio e o tratamento a partir
                    daí seguem a política do WhatsApp.
                </p>
                <p>Também podemos fornecer dados a autoridades públicas quando houver obrigação legal ou ordem judicial.</p>
            </>
        ),
    },
    {
        id: "transferencia",
        title: "Transferência internacional",
        content: (
            <p>
                Alguns fornecedores, como Supabase, Vercel, RevenueCat, Sentry e PostHog, armazenam ou processam dados em servidores localizados
                fora do Brasil, principalmente nos Estados Unidos. Essas transferências são feitas para a execução do
                contrato e com fornecedores que adotam garantias de proteção compatíveis com a LGPD (art. 33).
            </p>
        ),
    },
    {
        id: "seguranca",
        title: "Como protegemos os dados",
        content: (
            <UL>
                <li>Comunicação sempre criptografada (HTTPS/TLS).</li>
                <li>Senhas armazenadas com criptografia irreversível; nunca temos acesso à sua senha.</li>
                <li>
                    Isolamento entre igrejas no próprio banco de dados: uma igreja nunca enxerga os dados de outra,
                    e cada Usuário só acessa as áreas liberadas pelo Pastor.
                </li>
                <li>Dados de cartão tratados apenas pelo Pagar.me.</li>
                <li>Testes automáticos de segurança e de permissões a cada atualização do sistema.</li>
                <li>
                    Em caso de incidente de segurança que possa causar risco relevante, comunicaremos os afetados e a
                    Autoridade Nacional de Proteção de Dados (ANPD), conforme o art. 48 da LGPD.
                </li>
            </UL>
        ),
    },
    {
        id: "retencao",
        title: "Por quanto tempo guardamos os dados",
        content: (
            <UL>
                <li>Enquanto a conta estiver ativa, os dados são mantidos para a prestação do serviço.</li>
                <li>
                    Eventos e escalas com data anterior ao dia atual são removidos automaticamente todos os dias, junto
                    com as confirmações de presença.
                </li>
                <li>
                    No Ministério Infantil, o cadastro arquivado (por exemplo, quando a criança sai do ministério) fica
                    oculto e é <strong>apagado automaticamente 12 meses depois</strong>. Até lá, a igreja pode
                    desarquivar ou apagar na hora. Se o único responsável por uma criança arquivada for excluído, o
                    cadastro dela é apagado junto.
                </li>
                <li>
                    Na exclusão de conta, os dados são apagados da base principal na hora (veja as regras na seção
                    “Seus direitos”). Cópias de segurança mantidas pelos provedores são sobrescritas automaticamente
                    em período limitado.
                </li>
                <li>
                    Podemos manter por mais tempo apenas o necessário para cumprir obrigações legais — como registros
                    de acesso por 6 meses (Marco Civil da Internet) e registros de pagamento pelo prazo fiscal — ou
                    para o exercício de direitos.
                </li>
            </UL>
        ),
    },
    {
        id: "direitos",
        title: "Seus direitos",
        content: (
            <>
                <p>Conforme o art. 18 da LGPD, você pode solicitar:</p>
                <UL>
                    <li>confirmação de que tratamos seus dados e acesso a eles;</li>
                    <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                    <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
                    <li>portabilidade dos dados;</li>
                    <li>informação sobre com quem compartilhamos seus dados;</li>
                    <li>revogação do consentimento, quando ele for a base do tratamento.</li>
                </UL>
                <p>
                    Envie seu pedido para <Mail />. Podemos pedir informações para confirmar sua identidade.
                    Respondemos em até 15 dias.
                </p>
                <p>
                    <strong>Excluir a conta:</strong> você mesmo pode fazer isso, a qualquer momento, pelo menu do
                    perfil no aplicativo ou pela página{" "}
                    <Link href="/excluir-conta" className="text-teal-700 underline">Excluir conta</Link>. Se você for
                    o Titular e houver outro Pastor ativo, a igreja passa para ele; se não houver, a igreja e todos os
                    seus dados são apagados. Usuários convidados excluem apenas a própria conta.
                </p>
                <p>
                    <strong>Pais e responsáveis</strong> podem pedir à igreja, a qualquer momento, para ver, corrigir ou
                    apagar os dados da criança, e podem retirar a autorização. Nesse caso, a igreja deve apagar o
                    cadastro. Se preferir, escreva para <Mail /> e encaminharemos o pedido à igreja.
                </p>
                <p>
                    Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
                </p>
            </>
        ),
    },
    {
        id: "cookies",
        title: "Cookies e armazenamento no aparelho",
        content: (
            <UL>
                <li>
                    O site usa apenas armazenamento essencial no navegador, para manter você conectado e, se você
                    escolher, lembrar o seu e-mail na tela de login.
                </li>
                <li>
                    O site não usa cookies de publicidade nem de rastreamento. As estatísticas de visita não usam
                    cookies e não guardam nada no navegador.
                </li>
                <li>
                    O aplicativo guarda a sessão de forma protegida no aparelho e pode pedir permissão para enviar
                    lembretes locais e para acessar arquivos quando você importa uma planilha. Esses lembretes são
                    gerados no próprio aparelho.
                </li>
                <li>
                    O aplicativo envia relatórios de falhas e estatísticas de uso sem dados que identifiquem você (veja “Quais dados tratamos”). Não há publicidade nem rastreamento entre aplicativos.
                </li>
            </UL>
        ),
    },
    {
        id: "alteracoes",
        title: "Alterações desta Política",
        content: (
            <p>
                Esta Política pode ser atualizada. A data e a versão ficam sempre no topo da página, e mudanças
                relevantes serão comunicadas pelo e-mail cadastrado ou na própria Plataforma.
            </p>
        ),
    },
    {
        id: "contato",
        title: "Contato",
        content: (
            <p>
                Para dúvidas ou pedidos sobre dados pessoais, fale com o encarregado {LEGAL.DPO_NAME} pelo e-mail{" "}
                <Mail />.
            </p>
        ),
    },
];

export default function PrivacidadePage() {
    return (
        <LegalDocument
            kind="privacidade"
            title="Política de Privacidade"
            intro={
                <p>
                    Esta Política explica, de forma clara, quais dados pessoais o {LEGAL.PRODUCT} trata, para quê, com
                    quem compartilha e como você pode exercer seus direitos, conforme a Lei Geral de Proteção de Dados
                    (Lei 13.709/2018 — LGPD).
                </p>
            }
            summary={[
                "Os dados de membros e visitantes pertencem à igreja; nós os tratamos só para prestar o serviço.",
                "Não vendemos dados e não usamos dados para publicidade.",
                "Uma igreja nunca enxerga os dados de outra.",
                "Não guardamos o número do seu cartão: o pagamento é feito pelo Pagar.me.",
                "Você pode acessar, corrigir ou excluir seus dados, e excluir sua conta quando quiser.",
            ]}
            sections={sections}
        />
    );
}
