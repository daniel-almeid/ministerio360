"use client";

import { supabase } from "../../../../lib/supabaseClient";

export type CreateScaleInput = {
    date: string;
    event: string;
    responsible: string;
    ministries: { id: string; name: string }[];
};

export async function fetchScales() {
    const { data, error } = await supabase
        .from("scales")
        .select("id, date, event_name, responsible, ministries")
        .order("date", { ascending: true });

    if (error) {
        console.error("Erro ao carregar escalas:", error.message);
        return [];
    }

    return (
        data?.map((row: any) => ({
            id: row.id,
            date: row.date,
            event: row.event_name,
            responsible: row.responsible,
            ministries: row.ministries || [],
        })) ?? []
    );
}

export async function createScale(payload: CreateScaleInput, churchId: string) {
    const isoDate = `${payload.date}T12:00:00`;

    const { error } = await supabase.from("scales").insert({
        date: isoDate,
        event_name: payload.event,
        responsible: payload.responsible,
        ministries: payload.ministries,
        church_id: churchId,
    });

    if (error) throw new Error(error.message);

    return true;
}
