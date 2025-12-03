"use client";

import Link from "next/link";

export default function PrivacidadePage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">

            <h1 className="text-4xl font-bold text-gray-800">Política de Privacidade</h1>
            <p className="text-gray-600 mt-2">Última atualização: 05 de Dezembro de 2025</p>

            <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">1. Introdução</h2>
                    <p className="mt-2">
                        Esta Política explica como coletamos, utilizamos e protegemos dados pessoais
                        dentro do Ministério360, conforme a LGPD (Lei 13.709/2018).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">2. Dados que Coletamos</h2>
                    <ul className="list-disc ml-6 mt-2 space-y-2">
                        <li>Nome, e-mail e senha (criptografada).</li>
                        <li>Dados da igreja cadastrada.</li>
                        <li>Informações inseridas pelo usuário: membros, visitantes, finanças, eventos etc.</li>
                        <li>Dados de acesso: IP, dispositivo, navegador.</li>
                        <li>Dados de pagamento processados pelo Pagar.me.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">3. Como Utilizamos Dados</h2>
                    <ul className="list-disc ml-6 mt-2 space-y-2">
                        <li>Gerenciar a conta do usuário.</li>
                        <li>Processar assinaturas e pagamentos.</li>
                        <li>Fornecer funcionalidades do sistema.</li>
                        <li>Garantir segurança e monitoramento.</li>
                        <li>Enviar comunicações essenciais.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">4. Base Legal (LGPD)</h2>
                    <p className="mt-2">
                        Tratamos dados com base em:
                    </p>
                    <ul className="list-disc ml-6 mt-2 space-y-2">
                        <li>Consentimento do usuário.</li>
                        <li>Execução de contrato (uso do sistema).</li>
                        <li>Interesses legítimos da plataforma.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">5. Compartilhamento</h2>
                    <p className="mt-2">Compartilhamos dados apenas com serviços essenciais:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-2">
                        <li>Supabase — armazenamento e banco de dados.</li>
                        <li>Pagar.me — pagamento e assinaturas.</li>
                        <li>Serviços de e-mail e monitoramento.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">6. Segurança</h2>
                    <p className="mt-2">
                        Utilizamos criptografia, autenticação segura e infraestrutura moderna.
                        Nenhum dado é vendido ou exposto deliberadamente.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">7. Direitos do Usuário</h2>
                    <ul className="list-disc ml-6 mt-2 space-y-2">
                        <li>Acessar seus dados.</li>
                        <li>Corrigir ou atualizar.</li>
                        <li>Solicitar remoção.</li>
                        <li>Portabilidade.</li>
                        <li>Revogar consentimento.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">8. Exclusão e Retenção</h2>
                    <p className="mt-2">
                        Dados são mantidos enquanto a conta estiver ativa.
                        Após cancelamento, podem ser removidos mediante solicitação.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">9. Cookies</h2>
                    <p className="mt-2">
                        Utilizamos cookies para autenticação e análise de uso.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">10. Alterações</h2>
                    <p className="mt-2">
                        Podemos atualizar esta Política periodicamente. A data de atualização
                        estará sempre no início desta página.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-900">11. Contato</h2>
                    <p className="mt-2">
                        Para exercer direitos da LGPD, envie um e-mail para:
                        <span className="font-semibold"> danielandrade_2001@hotmail.com</span>
                    </p>
                </section>

            </div>
        </div>
    );
}
