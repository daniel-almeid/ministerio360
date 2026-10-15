import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Transaction = {
  id: string;
  type: "entrada" | "saida";
  category: string;
  amount: number;
  person_name?: string | null;
  created_at: string;
};

type PdfProps = {
  churchName: string;
  monthLabel: string;
  transactions: Transaction[];
};

export function generateFinancialPdf({
  churchName,
  monthLabel,
  transactions,
}: PdfProps) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(churchName, 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(120);
  doc.text(`Relatório Financeiro`, 14, 26);

  doc.setTextColor(0);
  doc.text(`Período: ${monthLabel}`, 14, 34);

  const tableData = transactions.map((t) => [
    t.type === "entrada" ? "Entrada" : "Saída",
    t.category,
    `R$ ${Number(t.amount).toFixed(2).replace(".", ",")}`,
    t.person_name || "-",
    new Date(t.created_at).toLocaleDateString("pt-BR"),
  ]);

  autoTable(doc, {
    startY: 42,
    head: [["Tipo", "Categoria", "Valor", "Pessoa / Motivo", "Data"]],
    body: tableData,
    headStyles: {
      fillColor: [56, 178, 172],
      textColor: 255,
    },
    styles: {
      fontSize: 9,
    },
  });

  const totalEntradas = transactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalSaidas = transactions
    .filter((t) => t.type === "saida")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const saldo = totalEntradas - totalSaidas;

  const y = (doc as any).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: y,
    head: [["Resumo", "Valor"]],
    body: [
      ["Total de entradas", `R$ ${totalEntradas.toFixed(2).replace(".", ",")}`],
      ["Total de saídas", `R$ ${totalSaidas.toFixed(2).replace(".", ",")}`],
      ["Saldo", `R$ ${saldo.toFixed(2).replace(".", ",")}`],
    ],
    headStyles: { fillColor: [56, 178, 172] },
    styles: { fontSize: 10 },
  });

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
    14,
    285
  );

  doc.save(`Relatorio-Financeiro-${monthLabel}.pdf`);
}
