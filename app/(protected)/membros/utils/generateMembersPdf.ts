import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Member } from "@/app/(protected)/membros/hook/useMembersData";

type PdfProps = {
    churchName: string;
    members: Member[];
};

export function generateMembersPdf({ churchName, members }: PdfProps) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(churchName, 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(120);
    doc.text("Relatório de Membros", 14, 26);

    doc.setTextColor(0);

    const tableData = members.map((m) => [
        m.name,
        m.ministry_name || "Sem ministério",
        m.is_active ? "Ativo" : "Inativo",
        m.phone || "—",
        m.email || "—",
        m.birth_date ? m.birth_date.split("-").reverse().join("/") : "—",
    ]);

    autoTable(doc, {
        startY: 34,
        head: [["Nome", "Ministério", "Status", "Telefone", "E-mail", "Nascimento"]],
        body: tableData,
        headStyles: {
            fillColor: [56, 178, 172],
            textColor: 255,
        },
        styles: {
            fontSize: 9,
        },
    });

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        285
    );

    doc.save("Relatorio-Membros.pdf");
}
