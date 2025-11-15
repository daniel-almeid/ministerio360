"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import EventSection from "./components/eventSection";
import ScaleSection from "./components/scaleSection";

export default function AgendaPage() {
    const [ministries, setMinistries] = useState<any[]>([]);

    async function load() {
        const { data } = await supabase.from("ministries").select("id, name").order("name");
        setMinistries(data || []);
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Eventos & Escalas</h2>

            <EventSection ministries={ministries} onRefreshMinistries={load} />
            <ScaleSection />
        </div>
    );
}
