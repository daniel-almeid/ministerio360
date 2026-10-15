import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Visitor = {
    name: string;
    visit_date: string | null;
    followup_status: "pendente" | "em_andamento" | "concluido";
    phone: string | null;
    email: string | null;
    is_member: boolean;
};

type PdfProps = {
    churchName: string;
    visitors: Visitor[];
};

export function generateVisitorsPdf({ churchName, visitors }: PdfProps) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(churchName, 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(120);
    doc.text("Relatório de Visitantes", 14, 26);
    doc.setTextColor(0);

    const tableData = visitors.map((v) => [
        v.name,
        v.visit_date ? v.visit_date.split("-").reverse().join("/") : "—",
        v.followup_status === "pendente"
            ? "Pendente"
            : v.followup_status === "em_andamento"
                ? "Em andamento"
                : "Concluído",
        v.phone || "—",
        v.email || "—",
        v.is_member ? "Sim" : "Não",
    ]);

    autoTable(doc, {
        startY: 34,
        head: [
            ["Nome", "Data da visita", "Follow-up", "Telefone", "E-mail", "É membro de alguma igreja?"],
        ],
        body: tableData,
        headStyles: {
            fillColor: [56, 178, 172],
            textColor: 255,
        },
        styles: { fontSize: 9 },
    });

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        285
    );

    doc.save("Relatorio-Visitantes.pdf");
}
