"use client";

import Link from "next/link";

export default function TermosPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">

            <h1 className="text-4xl font-bold text-gray-800">Termos de Uso</h1>
            <p className="text-gray-600 mt-2">Última atualização: 05 de Dezembro de 2025</p>

            <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">1. Introdução</h2>
                    <p className="mt-2">
                        Bem-vindo(a) ao Ministério360. Ao utilizar nossa plataforma, você concorda com
                        estes Termos de Uso. Leia atentamente.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">2. Definições</h2>
                    <p className="mt-2">
                        Para fins deste documento, o “Sistema” refere-se ao Ministério360; “Usuário”
                        é qualquer pessoa que cria uma conta; “Igreja” é a organização cadastrada pelo usuário.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">3. Aceitação dos Termos</h2>
                    <p className="mt-2">
                        Ao acessar ou utilizar o Ministério360, o Usuário declara concordar plenamente
                        com estes Termos. Caso não concorde, não utilize o sistema.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">4. Descrição do Serviço</h2>
                    <p className="mt-2">
                        O Ministério360 oferece ferramentas de gestão para igrejas, incluindo cadastro
                        de membros, visitantes, controle financeiro, eventos, escalas, relatórios e outras
                        funcionalidades que podem variar conforme o plano contratado.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">5. Cadastro e Conta</h2>
                    <ul className="list-disc ml-6 mt-2 space-y-2">
                        <li>Manter informações corretas e atualizadas.</li>
                        <li>Proteger suas credenciais de acesso.</li>
                        <li>Não compartilhar sua senha.</li>
                        <li>
                            Podemos suspender contas em caso de violação destes termos, fraude ou mau uso.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">6. Planos e Pagamentos</h2>
                    <p className="mt-2">
                        Planos Free, Standard e Premium podem incluir funcionalidades diferentes.
                        A cobrança é realizada pelo Pagar.me, sendo um pagamento mensal. O usuário pode
                        cancelar a qualquer momento, permanecendo com acesso até o fim do ciclo atual.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">7. Uso Permitido</h2>
                    <ul className="list-disc ml-6 mt-2 space-y-2">
                        <li>Não utilizar a plataforma para atividades ilegais.</li>
                        <li>Não tentar burlar, copiar ou modificar o sistema.</li>
                        <li>Não prejudicar outros usuários ou a infraestrutura do serviço.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">8. Responsabilidades</h2>
                    <p className="mt-2">
                        O usuário é responsável pelas informações que cadastrar. O Ministério360 se
                        compromete a manter o sistema disponível e seguro, mas não se responsabiliza por
                        danos indiretos, perdas internas da igreja ou quedas externas de serviços parceiros.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">9. Privacidade</h2>
                    <p className="mt-2">
                        O tratamento de dados segue a{" "}
                        <Link href="/privacidade" className="text-teal-600 underline">
                            Política de Privacidade
                        </Link>{" "}
                        e a LGPD (Lei 13.709/2018).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">10. Alterações</h2>
                    <p className="mt-2">
                        Os termos podem ser atualizados a qualquer momento. O uso contínuo da plataforma
                        significa concordância com as atualizações.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">11. Contato</h2>
                    <p className="mt-2">
                        Em caso de dúvidas, entre em contato pelo e-mail:
                        <span className="font-semibold"> danielandrade_2001@hotmail.com</span>
                    </p>
                </section>
            </div>
        </div>
    );
}
