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

        const { data: members } = await supabase
            .from("members")
            .select("id")
            .eq("is_active", true);

        const { data: visitors } = await supabase
            .from("visitors")
            .select("id, created_at")
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString());

        setActiveMembers(members?.length || 0);
        setMonthlyVisitors(visitors?.length || 0);
        setLoadingMembers(false);
    }

    return { loadingMembers, activeMembers, monthlyVisitors, loadMembersReport };
}
