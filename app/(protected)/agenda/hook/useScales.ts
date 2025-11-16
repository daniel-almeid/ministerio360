"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchScales, deleteScale } from "../services/scalesService";
import toast from "react-hot-toast";
import { ScaleItem } from "../../../types/agenda";

export function useScales() {
    const [scales, setScales] = useState<ScaleItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [selected, setSelected] = useState<ScaleItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [showNew, setShowNew] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const data = await fetchScales();
        setScales(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    function openNew() {
        setSelected(null);
        setShowNew(true);
    }

    function openView(item: ScaleItem) {
        setSelected(item);
        setDrawerOpen(true);
    }

    function openEdit(item: ScaleItem) {
        setSelected(item);
        setShowEdit(true);
    }

    function openDelete(item: ScaleItem) {
        setSelected(item);
        setShowDelete(true);
    }

    function closeAll() {
        setShowNew(false);
        setShowEdit(false);
        setShowDelete(false);
        setDrawerOpen(false);
        setSelected(null);
    }

    async function confirmDelete() {
        if (!selected) return;
        setDeleting(true);

        const { error } = await deleteScale(selected.id);

        if (!error) {
            toast.success("Escala excluída");
            await load();
        } else {
            toast.error("Erro ao excluir");
        }

        setDeleting(false);
        setShowDelete(false);
        setSelected(null);
    }

    return {
        scales,
        loading,
        selected,
        drawerOpen,
        showNew,
        showEdit,
        showDelete,
        deleting,
        load,
        openNew,
        openView,
        openEdit,
        openDelete,
        confirmDelete,
        closeAll,
    };
}
