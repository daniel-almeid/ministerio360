// Leitura de planilhas: transforma o arquivo (.xlsx, .xls ou .csv) numa tabela de células.
// Mesmo código do app; aqui o Excel é lido com import dinâmico.

export type Cell = string | number | boolean | null;
export type Table = Cell[][];

export const MAX_ROWS = 2000;

// ---------- texto (CSV) ----------

// Windows-1252: o "ANSI" que o Excel brasileiro usa ao salvar CSV comum
const CP1252_EXTRA: Record<number, number> = {
    0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021,
    0x88: 0x02c6, 0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d, 0x91: 0x2018,
    0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc,
    0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a, 0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
};

function decodeCp1252(bytes: Uint8Array) {
    let out = "";
    for (const b of bytes) out += String.fromCharCode(CP1252_EXTRA[b] ?? b);
    return out;
}

// UTF-8 estrito: retorna null se encontrar sequência inválida (aí o arquivo é ANSI)
function decodeUtf8Strict(bytes: Uint8Array): string | null {
    let out = "";
    let i = 0;

    while (i < bytes.length) {
        const b = bytes[i];
        let cp: number;
        let extra: number;

        if (b < 0x80) {
            cp = b;
            extra = 0;
        } else if (b >= 0xc2 && b <= 0xdf) {
            cp = b & 0x1f;
            extra = 1;
        } else if (b >= 0xe0 && b <= 0xef) {
            cp = b & 0x0f;
            extra = 2;
        } else if (b >= 0xf0 && b <= 0xf4) {
            cp = b & 0x07;
            extra = 3;
        } else {
            return null;
        }

        for (let k = 1; k <= extra; k++) {
            const c = bytes[i + k];
            if (c === undefined || (c & 0xc0) !== 0x80) return null;
            cp = (cp << 6) | (c & 0x3f);
        }

        out += String.fromCodePoint(cp);
        i += extra + 1;
    }

    return out;
}

export function decodeText(bytes: Uint8Array) {
    // Remove o BOM do "CSV UTF-8" do Excel
    const body = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? bytes.subarray(3) : bytes;
    return decodeUtf8Strict(body) ?? decodeCp1252(body);
}

// Descobre o separador olhando a primeira linha com conteúdo: ";" (Excel BR), "," ou tabulação
export function detectDelimiter(text: string) {
    const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
    const counts = [";", ",", "\t"].map((d) => ({ d, n: countOutsideQuotes(firstLine, d) }));
    counts.sort((a, b) => b.n - a.n);
    return counts[0].n > 0 ? counts[0].d : ";";
}

function countOutsideQuotes(line: string, delimiter: string) {
    let n = 0;
    let quoted = false;
    for (const ch of line) {
        if (ch === '"') quoted = !quoted;
        else if (ch === delimiter && !quoted) n++;
    }
    return n;
}

// Parser de CSV com suporte a aspas ("Silva, João"), aspas duplas escapadas e quebras de linha dentro de aspas
export function parseCsv(text: string, delimiter = detectDelimiter(text)): Table {
    const rows: Table = [];
    let row: Cell[] = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (quoted) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    quoted = false;
                }
            } else {
                field += ch;
            }
            continue;
        }

        if (ch === '"' && field.length === 0) {
            quoted = true;
        } else if (ch === delimiter) {
            row.push(field);
            field = "";
        } else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && text[i + 1] === "\n") i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += ch;
        }
    }

    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

// ---------- Excel ----------

// Carrega a biblioteca do Excel só quando alguém importa uma planilha (não pesa na abertura do site)
export async function parseWorkbook(bytes: Uint8Array): Promise<Table> {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(bytes, { type: "array", cellDates: false, cellText: false });

    // Usa a primeira aba que tiver conteúdo
    for (const name of wb.SheetNames) {
        const sheet = wb.Sheets[name];
        if (!sheet || !sheet["!ref"]) continue;

        const rows = XLSX.utils.sheet_to_json<Cell[]>(sheet, { header: 1, raw: true, defval: null, blankrows: true });
        if (!rows.some((r) => r.some((c) => c !== null && String(c).trim() !== ""))) continue;

        // Mantém a numeração igual à do Excel (linha 1 = índice 0), mesmo se a planilha começar mais abaixo
        const firstRow = XLSX.utils.decode_range(sheet["!ref"]).s.r;
        return [...Array.from({ length: firstRow }, () => [] as Cell[]), ...rows];
    }

    return [];
}

// ---------- entrada única ----------

export type FileKind = "excel" | "csv";

export function fileKind(fileName: string, bytes: Uint8Array): FileKind {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".csv") || lower.endsWith(".txt")) return "csv";
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".ods")) return "excel";

    // Sem extensão confiável: .xlsx começa com "PK" (zip) e .xls com D0 CF 11 E0
    if (bytes[0] === 0x50 && bytes[1] === 0x4b) return "excel";
    if (bytes[0] === 0xd0 && bytes[1] === 0xcf) return "excel";
    return "csv";
}

export async function readTable(fileName: string, bytes: Uint8Array): Promise<Table> {
    return fileKind(fileName, bytes) === "excel" ? parseWorkbook(bytes) : parseCsv(decodeText(bytes));
}
