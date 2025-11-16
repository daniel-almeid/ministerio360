import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PdfProps = {
    selectedMonth: string;
    monthLabel: string;
    financialData: any[];
    activeMembers: number;
    monthlyVisitors: number;
};

export function generatePdfReport({
    selectedMonth,
    monthLabel,
    financialData,
    activeMembers,
    monthlyVisitors,
}: PdfProps) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório Geral - Ministerio360", 14, 18);

    doc.setFontSize(12);
    doc.text(`Período: ${monthLabel}`, 14, 26);

    doc.setFontSize(14);
    doc.text("Relatório Financeiro", 14, 38);

    const financialTable = financialData.map((item) => [
        item.category,
        `R$ ${item.income.toFixed(2).replace(".", ",")}`,
        `R$ ${item.expense.toFixed(2).replace(".", ",")}`,
        `R$ ${item.balance.toFixed(2).replace(".", ",")}`,
    ]);

    const totalIncome = financialData.reduce((acc, i) => acc + i.income, 0);
    const totalExpense = financialData.reduce((acc, i) => acc + i.expense, 0);
    const totalBalance = totalIncome - totalExpense;

    autoTable(doc, {
        startY: 42,
        head: [["Categoria", "Entrada", "Saída", "Balanço"]],
        body: [
            ...financialTable,
            [
                "Total",
                `R$ ${totalIncome.toFixed(2).replace(".", ",")}`,
                `R$ ${totalExpense.toFixed(2).replace(".", ",")}`,
                `R$ ${totalBalance.toFixed(2).replace(".", ",")}`,
            ],
        ],
        headStyles: { fillColor: [56, 178, 172] },
        styles: { fontSize: 10 },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text("Relatório de membros", 14, y);

    autoTable(doc, {
        startY: y + 4,
        head: [["Indicador", "Valor"]],
        body: [
            ["Membros ativos", activeMembers],
            ["Visitantes recentes", monthlyVisitors],
        ],
        headStyles: { fillColor: [56, 178, 172] },
        styles: { fontSize: 10 },
    });

    const generatedAt = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(10);
    doc.text(`Gerado em: ${generatedAt}`, 14, 285);

    doc.save(`Relatório-${selectedMonth}.pdf`);
}
