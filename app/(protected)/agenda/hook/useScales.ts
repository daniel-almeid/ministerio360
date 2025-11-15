"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { ScaleItem } from "../../../types/agenda";
import { fetchScales } from "../services/scalesService";

export function useScales() {
  const [scales, setScales] = useState<ScaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    load();

    let channel: any;

    async function setupRealtime() {
      channel = supabase
        .channel("scales-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "scales" }, load)
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
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
