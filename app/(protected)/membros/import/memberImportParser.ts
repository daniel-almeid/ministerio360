import { MAX_ROWS, type Cell, type Table } from "./spreadsheet";
import type {
    ImportField,
    ImportPreview,
    ImportRow,
    ImportRowStatus,
    MinistryOption,
} from "./memberImport";

export class ImportError extends Error {}

// Tira acentos sem depender de String.normalize (nem todo motor JS de celular tem)
const ACCENTS: Record<string, string> = {
    á: "a", à: "a", â: "a", ã: "a", ä: "a", é: "e", è: "e", ê: "e", ë: "e", í: "i", ì: "i", î: "i", ï: "i",
    ó: "o", ò: "o", ô: "o", õ: "o", ö: "o", ú: "u", ù: "u", û: "u", ü: "u", ç: "c", ñ: "n",
};

function accentCount(value: string) {
    return (value.match(/[áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ]/g) ?? []).length;
}

export function stripAccents(value: string) {
    return value.toLowerCase().replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (ch) => ACCENTS[ch] ?? ch);
}

// "Data de Nascimento" -> "datadenascimento"
export function normalizeKey(value: unknown) {
    return stripAccents(String(value ?? "")).replace(/[^a-z0-9]/g, "");
}

// Nome para comparar duplicados: sem acento, minúsculo, espaços simples
export function normalizeName(value: string) {
    return stripAccents(value).replace(/\s+/g, " ").trim();
}

// Títulos de coluna aceitos para cada campo
const HEADER_ALIASES: Record<ImportField, string[]> = {
    name: ["nome", "nomecompleto", "membro", "nomedomembro", "nomemembro"],
    phone: ["telefone", "celular", "whatsapp", "whats", "zap", "fone", "tel", "contato", "telefonecelular", "telcelular", "numero"],
    email: ["email", "emails", "correioeletronico"],
    birth_date: ["datadenascimento", "datanascimento", "nascimento", "dtnascimento", "dtnasc", "datanasc", "nasc", "aniversario", "dn"],
    ministry: ["ministerio", "ministerios", "departamento", "area"],
    status: ["status", "situacao", "ativo", "ativoinativo"],
};

const FIELD_LABEL: Record<ImportField, string> = {
    name: "Nome",
    phone: "Telefone",
    email: "E-mail",
    birth_date: "Data de nascimento",
    ministry: "Ministério",
    status: "Status",
};

export function fieldLabel(field: ImportField) {
    return FIELD_LABEL[field];
}

function cellText(cell: Cell) {
    if (cell === null || cell === undefined) return "";
    return String(cell).trim();
}

// Acha a linha de títulos (pode não ser a primeira, se a planilha tiver um título em cima)
function findHeader(table: Table) {
    for (let r = 0; r < Math.min(table.length, 10); r++) {
        const keys = table[r].map(normalizeKey);
        if (keys.some((k) => HEADER_ALIASES.name.includes(k))) return r;
    }
    return -1;
}

function mapColumns(header: Cell[]) {
    const map: Partial<Record<ImportField, number>> = {};
    const ignored: string[] = [];

    header.forEach((cell, index) => {
        const key = normalizeKey(cell);
        if (!key) return;

        const field = (Object.keys(HEADER_ALIASES) as ImportField[]).find(
            (f) => map[f] === undefined && HEADER_ALIASES[f].includes(key)
        );

        if (field) map[field] = index;
        else ignored.push(cellText(cell));
    });

    return { map, ignored };
}

// ---------- normalização dos campos ----------

const LOWER_WORDS = new Set(["da", "das", "de", "do", "dos", "e"]);

// "MARIA DA SILVA" / "maria da silva" -> "Maria da Silva" (nomes já misturados ficam como estão)
export function tidyName(raw: string) {
    const name = raw.replace(/\s+/g, " ").trim();
    if (!name) return "";

    const allUpper = name === name.toUpperCase();
    const allLower = name === name.toLowerCase();
    if (!allUpper && !allLower) return name;

    return name
        .toLowerCase()
        .split(" ")
        .map((w, i) => (i > 0 && LOWER_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" ");
}

// Deixa o telefone no mesmo formato da tela de membros: "(11) 98888-1020"
export function tidyPhone(raw: Cell) {
    const text = cellText(typeof raw === "number" ? String(Math.round(raw)) : raw);
    if (!text) return null;

    // Número de outro país ("+1 415...") fica exatamente como veio
    if (text.startsWith("+") && !text.replace(/\s/g, "").startsWith("+55")) return text;

    let digits = text.replace(/\D/g, "").replace(/^0+/, "");
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) digits = digits.slice(2);

    if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

    return text; // formato diferente (outro país, ramal...): mantém como veio
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function pad(n: number) {
    return String(n).padStart(2, "0");
}

function validDate(y: number, m: number, d: number, today: Date) {
    if (y < 1900 || m < 1 || m > 12 || d < 1) return null;
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null; // ex.: 31/02
    if (date.getTime() > today.getTime()) return null; // nascimento no futuro
    return `${y}-${pad(m)}-${pad(d)}`;
}

// Aceita 14/03/1992, 14/3/92, 14-03-1992, 14.03.1992, 1992-03-14 e datas de célula do Excel
export function parseBirthDate(raw: Cell, today: Date = new Date()): string | null | "invalid" {
    if (raw === null || raw === undefined || cellText(raw) === "") return null;

    // Célula de data do Excel chega como número de série (dias desde 30/12/1899)
    if (typeof raw === "number") {
        if (raw < 1 || raw > 80000) return "invalid";
        const ms = Date.UTC(1899, 11, 30) + Math.floor(raw) * 86_400_000; // a parte decimal é a hora
        const d = new Date(ms);
        return validDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), today) ?? "invalid";
    }

    const text = cellText(raw);

    let m = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (m) return validDate(+m[1], +m[2], +m[3], today) ?? "invalid";

    m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
    if (m) {
        let year = +m[3];
        if (m[3].length === 2) {
            const cutoff = today.getFullYear() % 100;
            year += year > cutoff ? 1900 : 2000;
        }
        return validDate(year, +m[2], +m[1], today) ?? "invalid";
    }

    return "invalid";
}

const INACTIVE = new Set(["inativo", "inativa", "nao", "n", "0", "false", "desligado", "desligada", "afastado", "afastada"]);

function parseStatus(raw: Cell) {
    if (typeof raw === "boolean") return raw;
    const key = normalizeKey(raw);
    return key ? !INACTIVE.has(key) : true;
}

// ---------- montagem da prévia ----------

export function buildImportPreview(
    fileName: string,
    table: Table,
    existingNames: string[],
    ministries: MinistryOption[],
    today: Date = new Date()
): ImportPreview {
    const headerIndex = findHeader(table);
    if (headerIndex < 0) {
        throw new ImportError(
            "Não encontramos a coluna “Nome”. Coloque os títulos na primeira linha (Nome, Telefone, E-mail...) ou use o modelo."
        );
    }

    const { map, ignored } = mapColumns(table[headerIndex]);
    const dataRows = table.slice(headerIndex + 1);

    const nonEmpty = dataRows.filter((r) => r.some((c) => cellText(c) !== ""));
    if (nonEmpty.length === 0) throw new ImportError("A planilha não tem nenhum membro abaixo dos títulos.");
    if (nonEmpty.length > MAX_ROWS) {
        throw new ImportError(`A planilha tem ${nonEmpty.length} linhas. Importe no máximo ${MAX_ROWS} por vez.`);
    }

    const existing = new Set(existingNames.map(normalizeName));
    const seen = new Set<string>();
    const ministryByName = new Map(ministries.map((m) => [normalizeName(m.name), m]));
    const newMinistries = new Map<string, string>(); // nome normalizado -> nome que será criado

    const get = (row: Cell[], field: ImportField) => (map[field] === undefined ? null : row[map[field]!] ?? null);

    const rows: ImportRow[] = [];

    dataRows.forEach((row, i) => {
        if (!row.some((c) => cellText(c) !== "")) return; // linha em branco: ignora sem avisar

        const line = headerIndex + i + 2; // número da linha como aparece no Excel
        const issues: string[] = [];
        let status: ImportRowStatus = "ok";

        const name = tidyName(cellText(get(row, "name")));

        const phone = tidyPhone(get(row, "phone"));

        let email: string | null = cellText(get(row, "email")).toLowerCase() || null;
        if (email && !EMAIL_RE.test(email)) {
            issues.push(`E-mail inválido (${email}) — ficará em branco`);
            email = null;
        }

        let birth = parseBirthDate(get(row, "birth_date"), today);
        if (birth === "invalid") {
            issues.push(`Data de nascimento inválida (${cellText(get(row, "birth_date"))}) — ficará em branco`);
            birth = null;
        }

        // Ministério: liga ao que já existe; se não existir, será criado (uma vez só, mesmo
        // que apareça escrito de jeitos diferentes: "Coral", "CORAL", "coral")
        let ministryName: string | null = tidyName(cellText(get(row, "ministry"))) || null;
        let ministryId: string | null = null;
        if (ministryName) {
            const key = normalizeName(ministryName);
            const found = ministryByName.get(key);
            if (found) {
                ministryId = found.id;
                ministryName = found.name;
            } else {
                // Entre "Intercessao" e "Intercessão", fica a grafia com acento
                const current = newMinistries.get(key);
                if (!current || accentCount(ministryName) > accentCount(current)) newMinistries.set(key, ministryName);
            }
        }

        if (issues.length > 0) status = "warning";

        if (!name) {
            status = "error";
            issues.unshift("Linha sem nome — não será importada");
        } else {
            const key = normalizeName(name);
            if (existing.has(key)) {
                status = "duplicate";
                issues.unshift("Já existe um membro com este nome — não será importado");
            } else if (seen.has(key)) {
                status = "duplicate";
                issues.unshift("Nome repetido na planilha — só a primeira linha entra");
            }
            seen.add(key);
        }

        rows.push({
            line,
            status,
            issues,
            data: {
                name,
                phone,
                email,
                birth_date: birth,
                ministry_id: ministryId,
                ministry_name: ministryName,
                is_active: parseStatus(get(row, "status")),
            },
        });
    });

    const counts: Record<ImportRowStatus, number> = { ok: 0, warning: 0, duplicate: 0, error: 0 };
    rows.forEach((r) => counts[r.status]++);

    const columns: ImportPreview["columns"] = {};
    (Object.keys(map) as ImportField[]).forEach((f) => {
        columns[f] = cellText(table[headerIndex][map[f]!]);
    });

    // Todas as linhas passam a usar a mesma grafia do ministério novo
    rows.forEach((r) => {
        if (r.data.ministry_name && !r.data.ministry_id) {
            r.data.ministry_name = newMinistries.get(normalizeName(r.data.ministry_name)) ?? r.data.ministry_name;
        }
    });

    // Só cria ministério que for usado por alguém que vai entrar de fato
    const used = new Set(
        rows
            .filter((r) => (r.status === "ok" || r.status === "warning") && r.data.ministry_name && !r.data.ministry_id)
            .map((r) => normalizeName(r.data.ministry_name!))
    );
    const toCreate = [...newMinistries.entries()].filter(([key]) => used.has(key)).map(([, name]) => name);

    return { fileName, columns, ignoredColumns: ignored, newMinistries: toCreate, rows, counts };
}
