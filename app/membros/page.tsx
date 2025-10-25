export default function MembrosPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Membros</h2>

            <div className="flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Buscar membro..."
                    className="px-4 py-2 border rounded-lg w-1/3"
                />
                <button className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]">
                    + Adicionar Membro
                </button>
            </div>

            <table className="w-full text-sm bg-white rounded-xl shadow-md">
                <thead>
                    <tr className="text-left text-gray-500 border-b">
                        <th className="p-3">Nome</th>
                        <th className="p-3">Ministério</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b">
                        <td className="p-3">João Silva</td>
                        <td className="p-3">Louvor</td>
                        <td className="p-3 text-green-600">Ativo</td>
                        <td className="p-3 text-right text-[#38B2AC] cursor-pointer">
                            Editar
                        </td>
                    </tr>
                    <tr className="border-b">
                        <td className="p-3">Maria Souza</td>
                        <td className="p-3">Recepção</td>
                        <td className="p-3 text-red-500">Inativo</td>
                        <td className="p-3 text-right text-[#38B2AC] cursor-pointer">
                            Editar
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
