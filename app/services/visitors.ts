import { supabase } from "../../lib/supabaseClient";
import { Visitor } from "../types/visitors";

export async function getVisitors(archived: boolean = false): Promise<Visitor[]> {
    const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .eq("archived", archived)
        .order("visit_date", { ascending: false });

    if (error) throw error;

    return data as Visitor[];
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
