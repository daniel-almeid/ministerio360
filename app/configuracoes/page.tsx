"use client";

export default function ConfiguracoesPage() {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-5xl space-y-10">
                {/* Cabeçalho */}
                <header className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Configurações da Igreja</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Gerencie as informações cadastrais, responsáveis e dados financeiros da igreja.
                    </p>
                </header>

                {/* 1. Informações Institucionais */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
                        Informações Institucionais
                    </h3>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Razão Social
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                placeholder="Igreja Evangélica Ministério Vida Ltda"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Nome Fantasia
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                placeholder="Ministério Vida"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                CNPJ
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Data de Fundação
                            </label>
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Situação Cadastral
                            </label>
                            <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition">
                                <option>Ativa</option>
                                <option>Inativa</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Denominação / Cobertura Ministerial
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                                placeholder="Assembleia de Deus, Batista, Quadrangular..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Propósito ou Lema Institucional
                            </label>
                            <textarea
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
                                placeholder="Ex: Amar, servir e transformar vidas."
                            ></textarea>
                        </div>
                    </form>
                </section>

                {/* 2. Endereço e Contato */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
                        Endereço e Contato
                    </h3>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Endereço Completo
                            </label>
                            <input
                                type="text"
                                placeholder="Rua, número, bairro, cidade, UF, CEP"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Telefone / WhatsApp
                            </label>
                            <input
                                type="text"
                                placeholder="(00) 99999-9999"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                E-mail Institucional
                            </label>
                            <input
                                type="email"
                                placeholder="contato@igreja.com.br"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Site Oficial
                            </label>
                            <input
                                type="url"
                                placeholder="https://www.igreja.com.br"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Redes Sociais
                            </label>
                            <input
                                type="text"
                                placeholder="@instagram, /youtube, /facebook..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>
                    </form>
                </section>

                {/* 3. Responsáveis e Diretoria */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
                        Responsáveis e Diretoria
                    </h3>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Pastor Presidente / Líder Geral
                            </label>
                            <input
                                type="text"
                                placeholder="Nome completo"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Vice-Pastor / Copastor
                            </label>
                            <input
                                type="text"
                                placeholder="Nome completo"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Tesoureiro
                            </label>
                            <input
                                type="text"
                                placeholder="Nome completo"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Secretário(a)
                            </label>
                            <input
                                type="text"
                                placeholder="Nome completo"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Responsável Legal (nome, CPF, cargo)
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: João Silva - 000.000.000-00 - Presidente"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>
                    </form>
                </section>

                {/* 4. Dados Bancários e Financeiros */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
                        Dados Bancários e Financeiros
                    </h3>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Banco
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Banco do Brasil"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Agência
                            </label>
                            <input
                                type="text"
                                placeholder="0000-0"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Conta Corrente / Poupança
                            </label>
                            <input
                                type="text"
                                placeholder="00000-0"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Chave Pix
                            </label>
                            <input
                                type="text"
                                placeholder="CNPJ, e-mail ou telefone"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 block mb-1">
                                Uso Destinado
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Ex: Dízimos, ofertas, projetos sociais..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
                            ></textarea>
                        </div>
                    </form>

                    <div className="pt-6 flex justify-end">
                        <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition">
                            Salvar Alterações
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

