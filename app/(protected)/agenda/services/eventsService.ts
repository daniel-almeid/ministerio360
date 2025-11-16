"use client";

import { supabase } from "@/lib/supabaseClient";

export async function fetchEvents() {
    const { data, error } = await supabase
        .from("events")
        .select(
            `
      id,
      title,
      date,
      time,
      location,
      event_ministries (
        ministries (
          id,
          name
        )
      )
    `,
        )
        .order("date", { ascending: true });

    if (error) {
        console.error("Erro ao carregar eventos:", error.message);
        return [];
    }

    return (data || []).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        date: ev.date,
        time: ev.time,
        location: ev.location,
        ministries:
            ev.event_ministries?.map((em: any) => em.ministries)?.filter(Boolean) || [],
    }));
}
