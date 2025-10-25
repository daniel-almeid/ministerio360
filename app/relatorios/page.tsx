export default function RelatoriosPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Relatórios</h2>

            <section className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-gray-700 mb-4">Relatórios Financeiros</h3>

                <div className="flex gap-3 mb-4">
                    <select className="border rounded-lg px-3 py-2">
                        <option>Outubro / 2025</option>
                        <option>Setembro / 2025</option>
                        <option>Agosto / 2025</option>
                    </select>

                    <button className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]">
                        Gerar PDF
                    </button>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b">
                            <th className="pb-2">Categoria</th>
                            <th className="pb-2">Entradas</th>
                            <th className="pb-2">Saídas</th>
                            <th className="pb-2">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2">Ofertas / Dízimos</td>
                            <td className="py-2 text-green-600">R$ 3.000,00</td>
                            <td className="py-2 text-red-600">R$ 500,00</td>
                            <td className="py-2 font-semibold">R$ 2.500,00</td>
                        </tr>
                        <tr>
                            <td className="py-2">Eventos</td>
                            <td className="py-2 text-green-600">R$ 1.350,00</td>
                            <td className="py-2 text-red-600">R$ 780,00</td>
                            <td className="py-2 font-semibold">R$ 570,00</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-gray-700 mb-4">Relatórios de Membros</h3>
                <ul className="space-y-3">
                    <li>• Total de membros ativos: <strong>135</strong></li>
                    <li>• Visitantes recebidos no mês: <strong>18</strong></li>
                    <li>• Novos convertidos: <strong>6</strong></li>
                    <li>• Participação média semanal: <strong>87%</strong></li>
                </ul>
            </section>
        </div>
    );
}
