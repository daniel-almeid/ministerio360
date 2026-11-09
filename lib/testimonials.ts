import { createClient } from "@supabase/supabase-js";

// Depoimentos publicados (cadastrados pelo painel do Supabase, tabela "testimonials").
// Sem tabela, sem internet ou sem nenhum publicado: devolve lista vazia e a seção não aparece.
export type Testimonial = {
    id: string;
    author_name: string;
    author_role: string | null;
    church_name: string | null;
    city: string | null;
    quote: string;
    photo_url: string | null;
};

export async function fetchTestimonials(): Promise<Testimonial[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];

    try {
        const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
        const { data, error } = await supabase
            .from("testimonials")
            .select("id, author_name, author_role, church_name, city, quote, photo_url")
            .eq("published", true)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false })
            .limit(6);
        if (error) return [];
        return (data ?? []) as Testimonial[];
    } catch {
        return [];
    }
}
