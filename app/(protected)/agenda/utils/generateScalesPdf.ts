import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScaleItem } from "../../../types/agenda";

type PdfProps = {
    churchName: string;
    scales: ScaleItem[];
};

export function generateScalesPdf({ churchName, scales }: PdfProps) {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(16);
    doc.text(churchName, 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(120);
    doc.text("Relatório de Escalas", 14, 26);
    doc.setTextColor(0);

    const tableData = scales.map((s) => [
        format(parseISO(s.date), "dd/MM/yyyy", { locale: ptBR }),
        s.event,
        (s.ministries ?? []).map((m: { name: string }) => m.name).join(", ") || "—",
        s.responsible || "—",
    ]);

    autoTable(doc, {
        startY: 34,
        head: [["Data", "Evento", "Ministérios", "Responsável"]],
        body: tableData,
        headStyles: {
            fillColor: [56, 178, 172],
            textColor: 255,
        },
        styles: {
            fontSize: 9,
            cellPadding: 2,
        },
    });

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        285
    );

    doc.save("Relatorio-Escalas.pdf");
}
