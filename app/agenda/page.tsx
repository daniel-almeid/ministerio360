export default function AgendaPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Agenda & Escalas</h2>

            <section className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Próximos eventos</h3>
                    <button className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]">
                        + Novo Evento
                    </button>
                </div>

                <ul className="divide-y divide-gray-100">
                    <li className="py-3 flex justify-between">
                        <div>
                            <p className="font-medium">Culto de Jovens</p>
                            <span className="text-sm text-gray-500">25/10/2025 — 19h</span>
                        </div>
                        <span className="text-[#38B2AC] font-semibold">Louvor / Som / Recepção</span>
                    </li>

                    <li className="py-3 flex justify-between">
                        <div>
                            <p className="font-medium">Ensaio de Louvor</p>
                            <span className="text-sm text-gray-500">26/10/2025 — 18h</span>
                        </div>
                        <span className="text-[#38B2AC] font-semibold">Equipe de Louvor</span>
                    </li>

                    <li className="py-3 flex justify-between">
                        <div>
                            <p className="font-medium">Culto de Domingo</p>
                            <span className="text-sm text-gray-500">27/10/2025 — 10h</span>
                        </div>
                        <span className="text-[#38B2AC] font-semibold">Geral</span>
                    </li>
                </ul>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-gray-700 mb-3">Escala Semanal</h3>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b">
                            <th className="pb-2">Data</th>
                            <th className="pb-2">Evento</th>
                            <th className="pb-2">Ministério</th>
                            <th className="pb-2">Responsável</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2">25/10</td>
                            <td className="py-2">Culto Jovens</td>
                            <td className="py-2">Louvor</td>
                            <td className="py-2">Ana Paula</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2">26/10</td>
                            <td className="py-2">Ensaio Louvor</td>
                            <td className="py-2">Som</td>
                            <td className="py-2">Carlos Souza</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
}
