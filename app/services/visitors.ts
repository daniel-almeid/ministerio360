import { supabase } from "../../lib/supabaseClient";
import { Visitor } from "../types/visitors";

// Buscar visitantes (ativos ou arquivados)
export async function getVisitors(archived: boolean = false): Promise<Visitor[]> {
    const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .eq("archived", archived)
        .order("visit_date", { ascending: false });

    if (error) throw error;

    return data as Visitor[];
}

// Adicionar visitante
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
