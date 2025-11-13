"use client";

import { useEffect, useState, useMemo } from "react";
import { getVisitors } from "../../../services/visitors";
import { Visitor } from "../../../types/visitors";

export function useVisitorsData() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [reloadFlag, setReloadFlag] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    async function loadVisitors() {
        setLoading(true);
        try {
            const data = await getVisitors(showArchived);
            setVisitors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVisitors();
    }, [reloadFlag, showArchived]);

    const filteredVisitors = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return visitors;

        return visitors.filter((v) =>
            [v.name, v.email, v.phone]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(q)
                )
        );
    }, [search, visitors]);

    return {
        visitors,
        filteredVisitors,
        search,
        setSearch,
        loading,
        reloadFlag,
        setReloadFlag,
        showArchived,
        setShowArchived,
        loadVisitors,
    };
}
