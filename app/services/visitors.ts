import { supabase } from "../../lib/supabaseClient";
import { Visitor } from "../types/visitors";
import { fetchAllPages } from "../../lib/fetchAllPages";

// Todas as páginas: com mais de 1.000 visitantes o banco cortaria o resto da lista
export async function getVisitors(archived: boolean = false): Promise<Visitor[]> {
    return fetchAllPages<Visitor>((from, to) =>
        supabase
            .from("visitors")
            .select("*")
            .eq("archived", archived)
            .order("visit_date", { ascending: false })
            .order("id", { ascending: true })
            .range(from, to)
    );
}

export async function addVisitor(visitor: Omit<Visitor, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
        .from("visitors")
        .insert([visitor])
        .select()
        .single();

    if (error) {
        console.error("Erro Supabase ao adicionar visitante:", error);
        throw error;
    }

    return data as Visitor;
}

export async function archiveVisitor(id: string) {
    const { error } = await supabase
        .from("visitors")
        .update({ archived: true })
        .eq("id", id);

    if (error) {
        console.error("Erro ao arquivar visitante:", error);
        return { success: false, error };
    }

    return { success: true };
}
// "Tornar membro": depois de cadastrar o membro, o visitante sai da lista (arquivado e concluído)
export async function convertVisitorToMember(id: string): Promise<void> {
    const { error } = await supabase
        .from("visitors")
        .update({ archived: true, followup_status: "concluido" })
        .eq("id", id);
    if (error) throw error;
}
