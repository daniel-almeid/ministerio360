import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBRL } from "../finance/money";
import type { FinanceAccount, RecurringStatus } from "../finance/types";

type Transaction = {
  id: string;
  type: "entrada" | "saida";
  category: string;
  amount: number;
  person_name?: string | null;
  created_at: string;
  account_id?: string | null;
  member_id?: string | null;
  recurring_id?: string | null;
};

export type PdfTransfer = {
  id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  transfer_date: string; // AAAA-MM-DD
  note?: string | null;
};

type PdfProps = {
  churchName: string;
  monthLabel: string; // "2026-10"
  transactions: Transaction[];
  // Dados novos (opcionais: sem eles o PDF continua funcionando)
  accounts?: FinanceAccount[];
  transfers?: PdfTransfer[];
  recurring?: RecurringStatus[];
  typeFilter?: string; // "todas" | "entrada" | "saida"
  accountFilter?: string; // "todas" | id da conta
};

const TEAL: [number, number, number] = [56, 178, 172];
const GREEN: [number, number, number] = [21, 128, 61];
const RED: [number, number, number] = [185, 28, 28];
const AMBER: [number, number, number] = [180, 83, 9];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function periodLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return MONTHS[m - 1] ? `${MONTHS[m - 1]} de ${y}` : ym;
}

// DD/MM/AAAA ("AAAA-MM-DD" é lido como data local, sem voltar um dia)
function dateBR(value: string | Date) {
  const d =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
      : new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Cabeçalho das colunas de valor alinhado como os números abaixo
type Align = Record<number, "right" | "center">;
function alignHead(data: any, align: Align) {
  if (data.section === "head" && align[data.column.index]) data.cell.styles.halign = align[data.column.index];
}

export function generateFinancialPdf({
  churchName,
  monthLabel,
  transactions,
  accounts = [],
  transfers = [],
  recurring = [],
  typeFilter = "todas",
  accountFilter = "todas",
}: PdfProps) {
  const doc = new jsPDF();
  const accountName = (id?: string | null) => (id && accounts.find((a) => a.id === id)?.name) || "-";
  const showAccountColumn = accounts.length > 1;

  // ---------------------------------------------------------------- cabeçalho
  doc.setFontSize(16);
  doc.text(churchName, 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(120);
  doc.text("Relatório Financeiro", 14, 26);

  doc.setTextColor(0);
  doc.text(`Período: ${periodLabel(monthLabel)}`, 14, 34);

  const filters: string[] = [];
  if (typeFilter === "entrada") filters.push("somente entradas");
  if (typeFilter === "saida") filters.push("somente saídas");
  if (accountFilter !== "todas") filters.push(`conta ${accountName(accountFilter)}`);

  let y = 46;
  if (filters.length) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Filtro: ${filters.join(" · ")}`, 14, 40);
    y = 50;
  }

  function sectionTitle(title: string) {
    if (y > 255) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(title, 14, y);
    y += 3;
  }

  function afterTable() {
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // ------------------------------------------------------------- resumo
  const totalEntradas = transactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalSaidas = transactions
    .filter((t) => t.type === "saida")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const resultado = totalEntradas - totalSaidas;

  sectionTitle("Resumo do período");
  autoTable(doc, {
    startY: y,
    head: [["Resumo", "Valor"]],
    body: [
      ["Total de entradas", formatBRL(totalEntradas)],
      ["Total de saídas", formatBRL(totalSaidas)],
      ["Resultado do período", formatBRL(resultado)],
    ],
    headStyles: { fillColor: TEAL },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: "right" } },
    didParseCell: (data) => {
      alignHead(data, { 1: "right" });
      if (data.section === "body" && data.row.index === 2) {
        data.cell.styles.fontStyle = "bold";
        if (data.column.index === 1) data.cell.styles.textColor = resultado < 0 ? RED : GREEN;
      }
    },
  });
  afterTable();

  // ------------------------------------------------------ saldo das contas
  const balanceRows = accounts.filter(
    (a) => (a.is_active || a.balance !== 0) && (accountFilter === "todas" || a.id === accountFilter)
  );
  if (balanceRows.length) {
    const totalBalance = balanceRows.reduce((s, a) => s + a.balance, 0);
    const hasTotal = balanceRows.length > 1;

    sectionTitle(`Saldo das contas (em ${dateBR(new Date())})`);
    autoTable(doc, {
      startY: y,
      head: [["Conta", "Saldo atual"]],
      body: [
        ...balanceRows.map((a) => [a.name + (a.is_active ? "" : " (inativa)"), formatBRL(a.balance)]),
        ...(hasTotal ? [["Total", formatBRL(totalBalance)]] : []),
      ],
      headStyles: { fillColor: TEAL },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: "right" } },
      didParseCell: (data) => {
      alignHead(data, { 1: "right" });
        if (data.section !== "body") return;
        if (hasTotal && data.row.index === balanceRows.length) data.cell.styles.fontStyle = "bold";
        const value = hasTotal && data.row.index === balanceRows.length ? totalBalance : balanceRows[data.row.index]?.balance;
        if (data.column.index === 1 && value < 0) data.cell.styles.textColor = RED;
      },
    });
    afterTable();
  }

  // ------------------------------------------------- contribuições por membro
  const byMember = new Map<string, { name: string; count: number; total: number }>();
  transactions
    .filter((t) => t.type === "entrada" && t.member_id)
    .forEach((t) => {
      const key = t.member_id as string;
      const row = byMember.get(key) ?? { name: t.person_name || "Membro", count: 0, total: 0 };
      row.count += 1;
      row.total += Number(t.amount);
      byMember.set(key, row);
    });

  if (byMember.size) {
    const rows = [...byMember.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    sectionTitle("Contribuições por membro");
    autoTable(doc, {
      startY: y,
      head: [["Membro", "Lançamentos", "Total"]],
      body: [
        ...rows.map((r) => [r.name, String(r.count), formatBRL(r.total)]),
        ["Total", String(rows.reduce((s, r) => s + r.count, 0)), formatBRL(rows.reduce((s, r) => s + r.total, 0))],
      ],
      headStyles: { fillColor: TEAL },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: "center" }, 2: { halign: "right" } },
      didParseCell: (data) => {
      alignHead(data, { 1: "center", 2: "right" });
        if (data.section === "body" && data.row.index === rows.length) data.cell.styles.fontStyle = "bold";
      },
    });
    afterTable();
  }

  // ---------------------------------------------------- contas fixas do mês
  const recurringRows =
    typeFilter === "entrada"
      ? []
      : recurring.filter((s) => accountFilter === "todas" || s.item.account_id === accountFilter);

  if (recurringRows.length) {
    const pending = recurringRows.filter((s) => !s.payment);
    const pendingInfo = pending.length
      ? ` · ${pending.length} a pagar (${formatBRL(pending.reduce((s, r) => s + r.item.amount, 0))})`
      : " · todas pagas";
    const STATUS: Record<RecurringStatus["state"], string> = {
      paid: "Paga",
      overdue: "Vencida",
      today: "Vence hoje",
      upcoming: "A vencer",
    };

    sectionTitle(`Contas fixas do mês${pendingInfo}`);
    autoTable(doc, {
      startY: y,
      head: [["Descrição", "Vencimento", "Previsto", "Pago", "Situação"]],
      body: recurringRows.map((s) => [
        s.item.description,
        dateBR(s.dueDate),
        formatBRL(s.item.amount),
        s.payment ? formatBRL(s.payment.amount) : "-",
        STATUS[s.state],
      ]),
      headStyles: { fillColor: TEAL },
      styles: { fontSize: 9 },
      columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
      didParseCell: (data) => {
      alignHead(data, { 2: "right", 3: "right" });
        if (data.section !== "body" || data.column.index !== 4) return;
        const state = recurringRows[data.row.index]?.state;
        if (state === "paid") data.cell.styles.textColor = GREEN;
        if (state === "overdue") data.cell.styles.textColor = RED;
        if (state === "today") data.cell.styles.textColor = AMBER;
      },
    });
    afterTable();
  }

  // ------------------------------------------------------- transferências
  const transferRows = transfers.filter(
    (t) => accountFilter === "todas" || t.from_account_id === accountFilter || t.to_account_id === accountFilter
  );
  if (transferRows.length) {
    sectionTitle("Transferências entre contas");
    autoTable(doc, {
      startY: y,
      head: [["Data", "De", "Para", "Valor", "Observação"]],
      body: transferRows.map((t) => [
        dateBR(t.transfer_date),
        accountName(t.from_account_id),
        accountName(t.to_account_id),
        formatBRL(Number(t.amount)),
        t.note || "-",
      ]),
      headStyles: { fillColor: TEAL },
      styles: { fontSize: 9 },
      columnStyles: { 3: { halign: "right" } },
      didParseCell: (data) => alignHead(data, { 3: "right" }),
    });
    y = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("Transferências só movem dinheiro entre contas: não contam como entrada nem saída.", 14, y);
    y += 10;
  }

  // ------------------------------------------------------------ lançamentos
  const valueCol = showAccountColumn ? 5 : 4;

  sectionTitle("Lançamentos");
  autoTable(doc, {
    startY: y,
    head: [["Data", "Tipo", "Categoria", "Pessoa / Motivo", ...(showAccountColumn ? ["Conta"] : []), "Valor"]],
    body: transactions.map((t) => [
      dateBR(t.created_at),
      t.type === "entrada" ? "Entrada" : "Saída",
      t.category + (t.recurring_id ? " (fixa)" : ""),
      (t.person_name || "-") + (t.member_id ? " (membro)" : ""),
      ...(showAccountColumn ? [accountName(t.account_id)] : []),
      formatBRL(Number(t.amount)),
    ]),
    headStyles: { fillColor: TEAL, textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: { [valueCol]: { halign: "right" } },
    didParseCell: (data) => {
      alignHead(data, { [valueCol]: "right" });
      if (data.section !== "body" || data.column.index !== valueCol) return;
      data.cell.styles.textColor = transactions[data.row.index]?.type === "saida" ? RED : GREEN;
    },
  });

  // ---------------------------------------------------------------- rodapé
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Gerado em: ${dateBR(new Date())}`, 14, 288);
    doc.text(`Página ${i} de ${pages}`, 196, 288, { align: "right" });
  }

  doc.save(`Relatorio-Financeiro-${monthLabel}.pdf`);
}
