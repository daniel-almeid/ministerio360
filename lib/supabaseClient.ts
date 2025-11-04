import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 🔹 Reforça a sincronização do claim church_id sempre que a sessão mudar
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    try {
      await supabase.rpc("refresh_church_claim", { p_user_id: session.user.id });

      // 🔄 Força refresh imediato do token
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed?.session) {
        await supabase.auth.setSession(refreshed.session);
        console.log("✅ JWT atualizado com claim church_id.");
      }
    } catch (err) {
      console.error("Erro ao atualizar JWT:", err);
    }
  }
});
