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
        `
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
      ev.event_ministries?.map((em: any) => em?.ministries)?.filter(Boolean) || [],
  }));
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  return { error };
}

export async function updateEvent(id: string, payload: any) {
  const { error } = await supabase.from("events").update(payload).eq("id", id);
  return { error };
}
