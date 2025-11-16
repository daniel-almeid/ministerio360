"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RelatoriosPage() {
    const [relatorioFinanceiro, setRelatorioFinanceiro] = useState<any[]>([]);
    const [loadingFinanceiro, setLoadingFinanceiro] = useState(true);
    const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
        const hoje = new Date();
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
    });

    const [loadingMembros, setLoadingMembros] = useState(true);
    const [totalMembrosAtivos, setTotalMembrosAtivos] = useState<number>(0);
    const [totalVisitantesMes, setTotalVisitantesMes] = useState<number>(0);

    async function carregarRelatorioFinanceiro() {
        setLoadingFinanceiro(true);

        const [ano, mes] = mesSelecionado.split("-");
        const inicioMes = new Date(Number(ano), Number(mes) - 1, 1);
        const fimMes = new Date(Number(ano), Number(mes), 0, 23, 59, 59);

        const { data, error } = await supabase
            .from("transactions")
            .select("category, type, amount, created_at")
            .gte("created_at", inicioMes.toISOString())
            .lte("created_at", fimMes.toISOString());

        if (error) {
            console.error("Erro ao carregar dados financeiros:", error);
            setRelatorioFinanceiro([]);
            setLoadingFinanceiro(false);
            return;
        }

        const agrupado: Record<string, { entradas: number; saidas: number }> = {};

        data?.forEach((t) => {
            const categoria = t.category || "Sem categoria";
            if (!agrupado[categoria]) {
                agrupado[categoria] = { entradas: 0, saidas: 0 };
            }
            if (t.type === "entrada") agrupado[categoria].entradas += Number(t.amount);
            if (t.type === "saida") agrupado[categoria].saidas += Number(t.amount);
        });

        const resultado = Object.entries(agrupado).map(([categoria, valores]) => ({
            categoria,
            entradas: valores.entradas,
            saidas: valores.saidas,
            saldo: valores.entradas - valores.saidas,
        }));

        setRelatorioFinanceiro(resultado);
        setLoadingFinanceiro(false);
    }

    async function carregarRelatorioMembros() {
        setLoadingMembros(true);

        const [ano, mes] = mesSelecionado.split("-");
        const inicioMes = new Date(Number(ano), Number(mes) - 1, 1);
        const fimMes = new Date(Number(ano), Number(mes), 0, 23, 59, 59);

        try {
            const { data: membrosAtivos, error: membrosError } = await supabase
                .from("members")
                .select("id, is_active")
                .eq("is_active", true);

            if (membrosError) throw membrosError;

            const { data: visitantes, error: visitantesError } = await supabase
                .from("visitors")
                .select("id, created_at")
                .gte("created_at", inicioMes.toISOString())
                .lte("created_at", fimMes.toISOString());

            if (visitantesError) throw visitantesError;

            setTotalMembrosAtivos(membrosAtivos?.length || 0);
            setTotalVisitantesMes(visitantes?.length || 0);
        } catch (err: any) {
            console.error("Erro ao carregar relatório de membros:", err?.message || err);
        } finally {
            setLoadingMembros(false);
        }
    }

    useEffect(() => {
        carregarRelatorioFinanceiro();
        carregarRelatorioMembros();
    }, [mesSelecionado]);

    const totalEntradas = relatorioFinanceiro.reduce((acc, item) => acc + item.entradas, 0);
    const totalSaidas = relatorioFinanceiro.reduce((acc, item) => acc + item.saidas, 0);
    const saldoTotal = totalEntradas - totalSaidas;

    function gerarPDF() {
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(16);
        doc.text("Relatório Geral - Ministério360", 14, 18);
        doc.setFontSize(12);
        const [ano, mes] = mesSelecionado.split("-");
        const nomeMes = new Date(Number(ano), Number(mes) - 1).toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
        });
        doc.text(`Período: ${nomeMes}`, 14, 26);

        doc.setFontSize(14);
        doc.text("Relatório Financeiro", 14, 38);

        const tabelaFinanceira = relatorioFinanceiro.map((item) => [
            item.categoria,
            `R$ ${item.entradas.toFixed(2).replace(".", ",")}`,
            `R$ ${item.saidas.toFixed(2).replace(".", ",")}`,
            `R$ ${item.saldo.toFixed(2).replace(".", ",")}`,
        ]);

        autoTable(doc, {
            startY: 42,
            head: [["Categoria", "Entradas", "Saídas", "Saldo"]],
            body: [
                ...tabelaFinanceira,
                [
                    "Total Geral",
                    `R$ ${totalEntradas.toFixed(2).replace(".", ",")}`,
                    `R$ ${totalSaidas.toFixed(2).replace(".", ",")}`,
                    `R$ ${saldoTotal.toFixed(2).replace(".", ",")}`,
                ],
            ],
            headStyles: { fillColor: [56, 178, 172] },
            styles: { fontSize: 10 },
        });

        const posY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text("Relatório de Membros", 14, posY);

        const membrosData = [
            ["Membros ativos", totalMembrosAtivos.toString()],
            ["Visitantes recebidos no mês", totalVisitantesMes.toString()],
            ["Novos convertidos", "6"],
            ["Participação média semanal", "87%"],
        ];

        autoTable(doc, {
            startY: posY + 4,
            head: [["Indicador", "Quantidade"]],
            body: membrosData,
            headStyles: { fillColor: [56, 178, 172] },
            styles: { fontSize: 10 },
        });

        const dataAtual = new Date().toLocaleDateString("pt-BR");
        doc.setFontSize(10);
        doc.text(`Gerado em: ${dataAtual}`, 14, 285);

        doc.save(`Relatorio-${mesSelecionado}.pdf`);
    }

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                    Relatórios
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                    Visualize dados financeiros e estatísticas gerais da igreja.
                </p>
            </header>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-700">
                        Relatórios Financeiros
                    </h3>
                    <div className="flex gap-3">
                        <input
                            type="month"
                            value={mesSelecionado}
                            onChange={(e) => setMesSelecionado(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        <button
                            onClick={gerarPDF}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                        >
                            Gerar PDF
                        </button>
                    </div>
                </div>

                {loadingFinanceiro ? (
                    <p className="text-gray-500 text-center py-6">Carregando...</p>
                ) : relatorioFinanceiro.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">
                        Nenhuma transação encontrada neste mês.
                    </p>
                ) : (
                    <div
                        className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                        <table className="w-full text-sm border-separate border-spacing-y-1">
                            <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                <tr className="text-gray-500 border-b">
                                    <th className="pb-3 text-left">Categoria</th>
                                    <th className="pb-3 text-right">Entradas</th>
                                    <th className="pb-3 text-right">Saídas</th>
                                    <th className="pb-3 text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {relatorioFinanceiro.map((item) => (
                                    <tr key={item.categoria} className="hover:bg-gray-50">
                                        <td className="py-2 text-gray-700">{item.categoria}</td>
                                        <td className="py-2 text-green-600 text-right font-medium">
                                            R$ {item.entradas.toFixed(2).replace(".", ",")}
                                        </td>
                                        <td className="py-2 text-red-600 text-right font-medium">
                                            R$ {item.saidas.toFixed(2).replace(".", ",")}
                                        </td>
                                        <td className="py-2 text-right font-semibold text-gray-800">
                                            R$ {item.saldo.toFixed(2).replace(".", ",")}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="bg-gray-50 border-t font-semibold">
                                    <td className="py-3 text-gray-800">Total Geral</td>
                                    <td className="py-3 text-green-700 text-right">
                                        R$ {totalEntradas.toFixed(2).replace(".", ",")}
                                    </td>
                                    <td className="py-3 text-red-700 text-right">
                                        R$ {totalSaidas.toFixed(2).replace(".", ",")}
                                    </td>
                                    <td
                                        className={`py-3 text-right ${saldoTotal >= 0 ? "text-green-700" : "text-red-700"
                                            }`}
                                    >
                                        R$ {saldoTotal.toFixed(2).replace(".", ",")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </section>


            {/* Seção de Membros */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Relatórios de Membros
                </h3>

                {loadingMembros ? (
                    <p className="text-gray-500 text-center py-6">Carregando...</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-gray-500 text-sm">Membros ativos</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalMembrosAtivos}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-gray-500 text-sm">
                                Visitantes recebidos no mês
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalVisitantesMes}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
