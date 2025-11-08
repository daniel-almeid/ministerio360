"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Church } from "lucide-react"; // ícone de igreja

export function Header() {
  const [churchName, setChurchName] = useState<string>("Carregando...");

  useEffect(() => {
    loadChurchName();
  }, []);

  async function loadChurchName() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const church_id = session?.user?.app_metadata?.church_id;
      if (!church_id) {
        setChurchName("Igreja não definida");
        return;
      }

      // Prioriza nome fantasia (trade_name)
      const { data: info, error } = await supabase
        .from("church_institutional_info")
        .select("trade_name")
        .eq("church_id", church_id)
        .limit(1);

      if (!error && info && info.length > 0 && info[0].trade_name) {
        setChurchName(info[0].trade_name);
      } else {
        // Fallback: church_profiles.name
        const { data: profile } = await supabase
          .from("church_profiles")
          .select("name")
          .eq("id", church_id)
          .single();

        setChurchName(profile?.name || "Sem nome");
      }
    } catch (err: any) {
      console.error("Erro ao carregar nome da igreja:", err.message);
      setChurchName("Erro ao carregar");
    }
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold"></h2>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">{churchName}</span>
        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
          <Church className="text-white w-5 h-5" />
        </div>
      </div>
    </header>
  );
}
