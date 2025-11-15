"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventItem, Ministry } from "../../../types/agenda";

export function useEvents(initialMinistries: Ministry[], onRefreshMinistries: () => void) {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [filterMinistry, setFilterMinistry] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();

        let channel: any;

        async function setupRealtime() {
            channel = supabase
                .channel("events-changes")
                .on("postgres_changes", { event: "*", schema: "public", table: "events" }, load)
                .subscribe();
        }

        setupRealtime();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    async function load() {
        setLoading(true);

        const { data, error } = await supabase
            .from("events")
            .select(`
        id,
        title,
        date,
        time,
        location,
        event_ministries ( ministries(id,name) )
    `)
            .order("date");

        if (error) {
            console.error("Erro ao carregar eventos:", error.message);
            setEvents([]);
        } else {
            const mapped = data?.map((ev: any) => ({
                ...ev,
                ministries: ev.event_ministries?.map((m: any) => m?.ministries).filter(Boolean) || [],
            }));
            setEvents(mapped);
        }

        setLoading(false);
        onRefreshMinistries();
    }

    const filtered = useMemo(() => {
        if (!filterMinistry) return events;
        return events.filter((e) => e.ministries?.some((m) => m.name === filterMinistry));
    }, [events, filterMinistry]);

    const grouped = useMemo(() => {
        return filtered.reduce<Record<string, EventItem[]>>((acc, ev) => {
            const key = format(new Date(ev.date), "MMMM yyyy", { locale: ptBR });
            (acc[key] ||= []).push(ev);
            return acc;
        }, {});
    }, [filtered]);

    const nextEvent = useMemo(() => {
        return [...events]
            .filter((e) => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [events]);

    return {
        events,
        loading,
        filterMinistry,
        setFilterMinistry,
        grouped,
        nextEvent,
        load,
    };
}
