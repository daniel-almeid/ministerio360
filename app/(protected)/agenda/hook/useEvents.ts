"use client";

import { useEffect, useState } from "react";
import { fetchEvents } from "../services/eventsService";
import { EventItem, Ministry } from "../../../types/agenda";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useEvents(ministries: Ministry[], onRefresh: () => void) {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterMinistry, setFilterMinistry] = useState("");
    const [grouped, setGrouped] = useState<Record<string, EventItem[]>>({});
    const [nextEvent, setNextEvent] = useState<EventItem | null>(null);

    useEffect(() => {
        load();
    }, [filterMinistry]);

    async function load() {
        setLoading(true);
        const data = await fetchEvents();

        let list: EventItem[] = data;

        if (filterMinistry) {
            list = data.filter((ev: any) =>
                ev.ministries?.some((m: any) => m.name === filterMinistry),
            );
        }

        const now = new Date();
        const upcoming = list.filter((ev) => parseISO(ev.date) >= now);
        setNextEvent(upcoming.length > 0 ? upcoming[0] : null);

        const groups: Record<string, EventItem[]> = {};

        list.forEach((ev) => {
            const month = format(parseISO(ev.date), "MMMM yyyy", { locale: ptBR });
            if (!groups[month]) groups[month] = [];
            groups[month].push(ev);
        });

        setGrouped(groups);
        setEvents(list);
        setLoading(false);
    }

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