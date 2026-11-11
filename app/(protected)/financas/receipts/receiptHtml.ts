// Recibo de contribuição e informe anual: monta o HTML que vira PDF (sem nada de React Native aqui)
import { reaisPorExtenso } from "./extenso";

export type ChurchIdentity = {
    name: string;
    cnpj: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
};

export type ReceiptData = {
    id: string;
    personName: string;
    category: string | null;
    amount: number;
    date: string; // ISO
};

export type StatementItem = {
    category: string | null;
    amount: number;
    date: string; // ISO
};

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MESES_MIN = MESES.map((m) => m.toLowerCase());

export function brl(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/ /g, " ");
}

const pad = (n: number) => String(n).padStart(2, "0");

// Data no horário do aparelho: 05/11/2026
export function dataCurta(iso: string) {
    const d = new Date(iso);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// 9 de novembro de 2026
export function dataPorExtenso(d: Date) {
    return `${d.getDate()} de ${MESES_MIN[d.getMonth()]} de ${d.getFullYear()}`;
}

export function escapeHtml(text: string) {
    return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Número do recibo: 8 primeiros caracteres do lançamento, sem traço
export function receiptNumber(id: string) {
    return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

// "Dízimo" e "Oferta" com acento e maiúscula; o resto como foi lançado
export function categoryLabel(category: string | null) {
    const c = (category ?? "").trim();
    if (!c) return "Contribuição";
    const key = c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    if (key === "dizimo" || key === "dizimos") return "Dízimo";
    if (key === "oferta" || key === "ofertas") return "Oferta";
    return c;
}

function churchHeader(church: ChurchIdentity) {
    const linhas = [
        church.cnpj ? `CNPJ ${escapeHtml(church.cnpj)}` : null,
        church.address ? escapeHtml(church.address) : null,
        [church.phone, church.email].filter(Boolean).map((t) => escapeHtml(t!)).join(" · ") || null,
    ].filter(Boolean);
    return `
      <div class="head">
        <div class="church">${escapeHtml(church.name)}</div>
        ${linhas.map((l) => `<div class="sub">${l}</div>`).join("")}
      </div>`;
}

const STYLE = `
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Roboto, Arial, sans-serif; color: #1F2937; margin: 0; padding: 36px 40px; font-size: 13px; }
    .head { border-bottom: 3px solid #0F766E; padding-bottom: 12px; margin-bottom: 22px; }
    .church { font-size: 20px; font-weight: 800; color: #1E3A5F; }
    .sub { font-size: 11.5px; color: #6B7280; margin-top: 2px; }
    h1 { font-size: 17px; letter-spacing: .5px; color: #0F766E; margin: 0 0 4px; text-transform: uppercase; }
    .meta { font-size: 11.5px; color: #6B7280; margin-bottom: 18px; }
    .valor { display: inline-block; font-size: 22px; font-weight: 800; color: #0F766E; background: #E6F7F5; border-radius: 10px; padding: 8px 14px; margin-bottom: 16px; }
    p { line-height: 1.65; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0 16px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; color: #6B7280; border-bottom: 1px solid #D1D5DB; padding: 7px 6px; }
    td { padding: 7px 6px; border-bottom: 1px solid #EEF2F7; }
    td.num, th.num { text-align: right; white-space: nowrap; }
    tr.total td { font-weight: 800; border-top: 2px solid #0F766E; border-bottom: none; color: #0F766E; }
    .sign { margin-top: 56px; width: 280px; border-top: 1px solid #374151; padding-top: 6px; text-align: center; font-size: 12px; }
    .place { margin-top: 26px; }
    .note { margin-top: 26px; font-size: 10.5px; color: #6B7280; line-height: 1.5; }
    .foot { margin-top: 10px; font-size: 10px; color: #9CA3AF; }
  </style>`;

function wrap(body: string) {
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8" />${STYLE}</head><body>${body}</body></html>`;
}

// Recibo de uma contribuição
export function buildReceiptHtml(church: ChurchIdentity, r: ReceiptData, now = new Date()) {
    const nome = escapeHtml(r.personName.trim() || "Contribuinte");
    const categoria = categoryLabel(r.category);
    return wrap(`
      ${churchHeader(church)}
      <h1>Recibo de ${escapeHtml(categoria.toLowerCase())}</h1>
      <div class="meta">Nº ${receiptNumber(r.id)}</div>
      <div class="valor">${brl(r.amount)}</div>
      <p>
        Recebemos de <strong>${nome}</strong> a importância de <strong>${brl(r.amount)}</strong>
        (${reaisPorExtenso(r.amount)}), referente a <strong>${escapeHtml(categoria.toLowerCase())}</strong>,
        em ${dataCurta(r.date)}.
      </p>
      <p>Para clareza, firmamos o presente recibo.</p>
      <p class="place">${dataPorExtenso(now)}.</p>
      <div class="sign">${escapeHtml(church.name)}<br/>Tesouraria</div>
      <div class="foot">Emitido pelo Ministério360</div>
    `);
}

export type StatementSummary = {
    months: { month: number; byCategory: Record<string, number>; total: number }[];
    categories: string[];
    totals: Record<string, number>;
    total: number;
};

// Soma por mês e por tipo (Dízimo, Oferta...) das entradas do ano
export function summarizeStatement(items: StatementItem[], year: number): StatementSummary {
    const ofYear = items.filter((i) => new Date(i.date).getFullYear() === year);
    const categories = [...new Set(ofYear.map((i) => categoryLabel(i.category)))].sort((a, b) => {
        const order = (c: string) => (c === "Dízimo" ? 0 : c === "Oferta" ? 1 : 2);
        return order(a) - order(b) || a.localeCompare(b, "pt-BR");
    });

    const months = Array.from({ length: 12 }, (_, month) => ({ month, byCategory: {} as Record<string, number>, total: 0 }));
    const totals: Record<string, number> = {};
    let total = 0;

    for (const i of ofYear) {
        const m = months[new Date(i.date).getMonth()];
        const c = categoryLabel(i.category);
        m.byCategory[c] = (m.byCategory[c] ?? 0) + i.amount;
        m.total += i.amount;
        totals[c] = (totals[c] ?? 0) + i.amount;
        total += i.amount;
    }

    return { months: months.filter((m) => m.total > 0), categories, totals, total: Math.round(total * 100) / 100 };
}

// Informe anual de contribuições de um membro
export function buildStatementHtml(church: ChurchIdentity, personName: string, year: number, items: StatementItem[], now = new Date()) {
    const s = summarizeStatement(items, year);
    const nome = escapeHtml(personName.trim() || "Contribuinte");
    const cols = s.categories;

    const linhas = s.months
        .map(
            (m) => `<tr><td>${MESES[m.month]}</td>${cols
                .map((c) => `<td class="num">${m.byCategory[c] ? brl(m.byCategory[c]) : "—"}</td>`)
                .join("")}<td class="num">${brl(m.total)}</td></tr>`
        )
        .join("");

    return wrap(`
      ${churchHeader(church)}
      <h1>Informe de contribuições ${year}</h1>
      <div class="meta">Contribuinte: ${nome}</div>
      <p>
        Declaramos, para os devidos fins, que <strong>${nome}</strong> contribuiu com esta igreja, no ano de
        ${year}, com o total de <strong>${brl(s.total)}</strong> (${reaisPorExtenso(s.total)}), conforme os
        lançamentos abaixo, registrados pela tesouraria.
      </p>
      <table>
        <thead><tr><th>Mês</th>${cols.map((c) => `<th class="num">${escapeHtml(c)}</th>`).join("")}<th class="num">Total</th></tr></thead>
        <tbody>
          ${linhas}
          <tr class="total"><td>Total no ano</td>${cols.map((c) => `<td class="num">${brl(s.totals[c])}</td>`).join("")}<td class="num">${brl(s.total)}</td></tr>
        </tbody>
      </table>
      <p class="place">${dataPorExtenso(now)}.</p>
      <div class="sign">${escapeHtml(church.name)}<br/>Tesouraria</div>
      <div class="note">
        Doações a igrejas não reduzem o imposto de renda devido. Se quiser, elas podem ser informadas na
        declaração, na ficha “Doações Efetuadas”, usando os dados da igreja acima. Em caso de dúvida, consulte um contador.
      </div>
      <div class="foot">Emitido pelo Ministério360</div>
    `);
}
