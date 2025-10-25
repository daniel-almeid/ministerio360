export default function VisitantesPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Visitantes</h2>

            <div className="flex justify-between items-center">
                <input
                    type="text"
                    className="px-4 py-2 border rounded-lg w-1/3"
                    placeholder="Buscar visitante..."
                />
                <button className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]">
                    + Registrar Visitante
                </button>
            </div>

            <table className="w-full text-sm bg-white rounded-xl shadow-md">
                <thead>
                    <tr className="text-left text-gray-500 border-b">
                        <th className="p-3">Nome</th>
                        <th className="p-3">Data da visita</th>
                        <th className="p-3">Status Follow-up</th>
                        <th className="p-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b">
                        <td className="p-3">Carlos Pereira</td>
                        <td className="p-3">20/10/2025</td>
                        <td className="p-3 text-yellow-500">Pendente</td>
                        <td className="p-3 text-right text-[#38B2AC] cursor-pointer">
                            Detalhes
                        </td>
                    </tr>
                    <tr className="border-b">
                        <td className="p-3">Fernanda Lima</td>
                        <td className="p-3">21/10/2025</td>
                        <td className="p-3 text-green-600">Concluído</td>
                        <td className="p-3 text-right text-[#38B2AC] cursor-pointer">
                            Detalhes
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
