import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventItem } from "../../../types/agenda";

type PdfProps = {
    churchName: string;
    events: EventItem[];
};

export function generateEventsPdf({ churchName, events }: PdfProps) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(churchName, 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(120);
    doc.text("Relatório de Eventos", 14, 26);
    doc.setTextColor(0);

    const tableData = events.map((ev) => [
        ev.title,
        format(parseISO(ev.date), "dd/MM/yyyy", { locale: ptBR }),
        ev.time?.slice(0, 5) || "—",
        ev.location || "—",
        (ev.ministries ?? [])
            .map((m: { name: string }) => m.name)
            .join(", ") || "—",
    ]);

    autoTable(doc, {
        startY: 34,
        head: [["Evento", "Data", "Hora", "Local", "Ministérios"]],
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

    doc.save("Relatorio-Eventos.pdf");
}
