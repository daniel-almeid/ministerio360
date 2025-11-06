import { createClient } from "@supabase/supabase-js";

// Para evitar conflito de storage entre abas
const createScopedStorage = () => {
  try {
    if (typeof window !== "undefined") {
      return window.sessionStorage; // isolado por aba
    }
  } catch (_) { }
  return undefined;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: createScopedStorage(),
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});