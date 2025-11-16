"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchScales } from "../services/scalesService";
import { ScaleItem } from "../../../types/agenda";

export function useScales() {
    const [scales, setScales] = useState<ScaleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        load();

        const channel = supabase
            .channel("scales-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "scales" },
                () => load(),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function load() {
        setLoading(true);
        const data = await fetchScales();
        setScales(data);
        setLoading(false);
    }

    return {
        scales,
        loading,
        isModalOpen,
        setIsModalOpen,
        selectedScaleId,
        setSelectedScaleId,
        load,
    };
}
