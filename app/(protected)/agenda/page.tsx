"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import EventSection from "./components/eventSection";
import ScaleSection from "./components/scaleSection";

export default function AgendaPage() {
    const [ministries, setMinistries] = useState<any[]>([]);

    async function load() {
        const { data } = await supabase
            .from("ministries")
            .select("id, name")
            .order("name");

        setMinistries(data || []);
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="flex flex-col space-y-6 max-h-[calc(100vh-110px)] overflow-y-auto custom-scrollbar pr-1">
            <EventSection ministries={ministries} onRefreshMinistries={load} />
            <ScaleSection />
        </div>
    );
}
