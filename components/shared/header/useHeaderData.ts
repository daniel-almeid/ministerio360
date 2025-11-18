"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useHeaderData() {
    const [churchName, setChurchName] = useState("Carregando...");
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            const church_id = session?.user?.app_metadata?.church_id;
            const email = session?.user?.email || null;
            setUserEmail(email);

            if (!church_id) {
                setChurchName("Igreja não definida");
                return;
            }

            const { data: info } = await supabase
                .from("church_institutional_info")
                .select("trade_name")
                .eq("church_id", church_id)
                .limit(1);

            if (info && info[0]?.trade_name) {
                setChurchName(info[0].trade_name);
                return;
            }

            const { data: profile } = await supabase
                .from("church_profiles")
                .select("name")
                .eq("id", church_id)
                .single();

            setChurchName(profile?.name || "Sem nome");
        } catch (err) {
            setChurchName("Erro ao carregar");
        }
    }

    return { churchName, userEmail };
}
