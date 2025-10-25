export default function ConfiguracoesPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Configurações</h2>

            <section className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-gray-700 mb-4">Informações da Igreja</h3>
                <form className="space-y-4 max-w-lg">
                    <div>
                        <label className="text-sm text-gray-500 block mb-1">Nome da Igreja</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2"
                            defaultValue="Igreja Esperança"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-500 block mb-1">Endereço</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2"
                            defaultValue="Rua Central, 123 - Florianópolis"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-500 block mb-1">Contato</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2"
                            defaultValue="(48) 99999-9999"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                    >
                        Salvar Alterações
                    </button>
                </form>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-md max-w-lg">
                <h3 className="font-semibold text-gray-700 mb-4">Usuários e Permissões</h3>
                <ul className="divide-y divide-gray-100">
                    <li className="py-3 flex justify-between">
                        <span>Pastor João (Administrador)</span>
                        <button className="text-[#E53E3E] hover:underline">Remover</button>
                    </li>
                    <li className="py-3 flex justify-between">
                        <span>Ana Paula (Tesoureira)</span>
                        <button className="text-[#E53E3E] hover:underline">Remover</button>
                    </li>
                </ul>

                <button className="mt-4 px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]">
                    + Adicionar Usuário
                </button>
            </section>
        </div>
    );
}
