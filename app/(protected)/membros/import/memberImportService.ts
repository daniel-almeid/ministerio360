import { supabase } from "../../../../lib/supabaseClient";
import { normalizeName } from "./memberImportParser";
import type { ImportResult, ImportRow, MinistryOption } from "./memberImport";

const PAGE_SIZE = 1000;
const CHUNK_SIZE = 100;

// Nomes já cadastrados (para não duplicar) e ministérios (para ligar pelo nome).
// As regras de acesso do banco já limitam à igreja de quem está logado.
export async function loadImportContext(): Promise<{ names: string[]; ministries: MinistryOption[] }> {
    const names: string[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
            .from("members")
            .select("name")
            .order("name")
            .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;
        for (const row of data ?? []) if (row.name) names.push(String(row.name));
        if (!data || data.length < PAGE_SIZE) break;
    }

    const { data: ministries, error } = await supabase.from("ministries").select("id, name").order("name");
    if (error) throw error;

    return {
        names,
        ministries: (ministries ?? []).map((m: any) => ({ id: String(m.id), name: String(m.name ?? "") })),
    };
}

// Cria os ministérios que faltam (mesmo formato do cadastro manual: nome + descrição vazia).
// Antes confere de novo o que já existe, para não duplicar se alguém criou nesse meio-tempo.
async function ensureMinistries(names: string[]) {
    const ids = new Map<string, string>(); // nome normalizado -> id
    const created: string[] = [];
    const errors: string[] = [];
    if (names.length === 0) return { ids, created, errors };

    const { data: current } = await supabase.from("ministries").select("id, name");
    for (const m of current ?? []) ids.set(normalizeName(String(m.name ?? "")), String(m.id));

    const missing = names.filter((n) => !ids.has(normalizeName(n)));

    for (const name of missing) {
        const { data, error } = await supabase
            .from("ministries")
            .insert([{ name, description: null }])
            .select("id, name")
            .single();

        if (error || !data) {
            errors.push(name);
        } else {
            ids.set(normalizeName(name), String(data.id));
            created.push(name);
        }
    }

    return { ids, created, errors };
}

// Mesmos campos que o cadastro manual de membro envia
function toPayload(row: ImportRow, ministryIds: Map<string, string>) {
    const ministryId =
        row.data.ministry_id ??
        (row.data.ministry_name ? ministryIds.get(normalizeName(row.data.ministry_name)) ?? null : null);

    return {
        name: row.data.name,
        phone: row.data.phone,
        email: row.data.email,
        birth_date: row.data.birth_date,
        ministry_id: ministryId,
        is_active: row.data.is_active,
    };
}

// Envia em lotes de 100. Se um lote falhar, tenta um por um para salvar o máximo possível
// e dizer exatamente quais linhas não entraram.
export async function insertMembers(
    rows: ImportRow[],
    newMinistries: string[],
    onProgress: (done: number, total: number) => void
): Promise<Omit<ImportResult, "skipped">> {
    const failed: ImportResult["failed"] = [];
    let imported = 0;
    let done = 0;

    const ministries = await ensureMinistries(newMinistries);

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase.from("members").insert(chunk.map((r) => toPayload(r, ministries.ids)));

        if (!error) {
            imported += chunk.length;
        } else {
            for (const row of chunk) {
                const { error: rowError } = await supabase.from("members").insert([toPayload(row, ministries.ids)]);
                if (rowError) failed.push({ line: row.line, name: row.data.name, reason: rowError.message });
                else imported++;
            }
        }

        done += chunk.length;
        onProgress(done, rows.length);
    }

    return { imported, failed, createdMinistries: ministries.created, ministryErrors: ministries.errors };
}
