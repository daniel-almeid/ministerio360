"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useMembersReport() {
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [activeMembers, setActiveMembers] = useState(0);
    const [monthlyVisitors, setMonthlyVisitors] = useState(0);

    async function loadMembersReport(month: string) {
        setLoadingMembers(true);

        const [year, monthNum] = month.split("-");
        const start = new Date(Number(year), Number(monthNum) - 1, 1);
        const end = new Date(Number(year), Number(monthNum), 0, 23, 59, 59);

        // Só a contagem (sem trazer as linhas): vale para qualquer quantidade de membros
        const { count: activeCount } = await supabase
            .from("members")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true);

        const { count: visitorCount } = await supabase
            .from("visitors")
            .select("id", { count: "exact", head: true })
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString());

        setActiveMembers(activeCount ?? 0);
        setMonthlyVisitors(visitorCount ?? 0);
        setLoadingMembers(false);
    }

    return { loadingMembers, activeMembers, monthlyVisitors, loadMembersReport };
}
