"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import EventSection from "./components/eventSection";
import ScaleSection from "./components/scaleSection";
import Loading from "@/components/shared/loading";

export default function AgendaPage() {
    const [ministries, setMinistries] = useState<any[]>([]);
    const [loadingMinistries, setLoadingMinistries] = useState(true);

    async function loadMinistries() {
        setLoadingMinistries(true);

        const { data, error } = await supabase
            .from("ministries")
            .select("id, name")
            .order("name");

        if (!error) setMinistries(data || []);

        setLoadingMinistries(false);
    }

    useEffect(() => {
        loadMinistries();
    }, []);

    if (loadingMinistries) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <Loading />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 max-h-[calc(100vh-110px)] overflow-y-auto custom-scrollbar pr-1">
            <EventSection 
                ministries={ministries} 
                onRefreshMinistries={loadMinistries} 
            />

            <ScaleSection ministries={ministries} />
        </div>
    );
}
