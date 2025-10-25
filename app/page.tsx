import { CardMetric } from "../components/cardMetric";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <CardMetric title="Entradas mês atual" value="R$ 4.350,00" color="#38B2AC" />
        <CardMetric title="Saídas mês atual" value="R$ 1.280,00" color="#E53E3E" />
        <CardMetric title="Novos visitantes" value="15" color="#81E6D9" />
        <CardMetric title="Próximo evento" value="Culto Domingo (27/10)" color="#3182CE" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-700 mb-3">Entradas vs Saídas</h3>
          <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500">
            [gráfico aqui futuramente]
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-700 mb-3">Próximos Eventos</h3>
          <ul className="divide-y divide-gray-100">
            <li className="py-2">Culto de Jovens — 25/10</li>
            <li className="py-2">Ensaio do Louvor — 26/10</li>
            <li className="py-2">Culto Domingo — 27/10</li>
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="font-semibold text-gray-700 mb-3">Visitantes recentes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Nome</th>
              <th className="pb-2">Data</th>
              <th className="pb-2">Contato</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-none">
              <td className="py-2">Maria Souza</td>
              <td className="py-2">20/10/2025</td>
              <td className="py-2 text-[#38B2AC]">WhatsApp</td>
            </tr>
            <tr className="border-b last:border-none">
              <td className="py-2">João Silva</td>
              <td className="py-2">22/10/2025</td>
              <td className="py-2 text-[#38B2AC]">WhatsApp</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
