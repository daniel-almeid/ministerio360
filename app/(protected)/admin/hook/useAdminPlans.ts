"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast from "react-hot-toast";

export type AdminUser = {
    user_id: string;
    user_name: string | null;
    email: string;
    created_at_user: string;
    church_id: string | null;
    church_name: string | null;
    created_at_church: string | null;
    plan_slug: string | null;
    subscription_active: boolean | null;
};

export function useAdmin(enabled: boolean) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        async function load() {
            setLoading(true);

            // Agora buscamos via public.profiles (fonte oficial da Admin Page)
            const { data, error } = await supabase
                .from("profiles")
                .select(`
                    id,
                    email,
                    created_at,
                    church_id,
                    plan_slug,
                    subscription_active,
                    church_profiles:church_id (
                        id,
                        trade_name,
                        created_at
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) {
                console.error(error);
                toast.error("Erro ao carregar usuários.");
                setLoading(false);
                return;
            }

            const formatted: AdminUser[] = (data as any[]).map(u => ({
                user_id: u.id,
                email: u.email,
                created_at_user: u.created_at,
                church_id: u.church_id ?? null,
                plan_slug: u.plan_slug ?? "free",
                subscription_active: u.subscription_active ?? false,
                church_name: u.church_profiles?.trade_name ?? null,
                created_at_church: u.church_profiles?.created_at ?? null,
                user_name: u.church_profiles?.trade_name ?? null
            }));

            setUsers(formatted);
            setLoading(false);
        }

        load();
    }, [enabled]);

    function openModal(user: AdminUser) {
        setSelectedUser(user);
        setModalOpen(true);
    }

    function closeModal() {
        setSelectedUser(null);
        setModalOpen(false);
    }

    async function saveChanges(values: { plan_slug: string; subscription_active: boolean }) {
        if (!selectedUser || !selectedUser.church_id) return;

        setSaving(true);

        // Atualiza church_profiles
        const { error } = await supabase
            .from("church_profiles")
            .update({
                plan_slug: values.plan_slug,
                subscription_active: values.subscription_active
            })
            .eq("id", selectedUser.church_id);

        if (error) {
            console.error(error);
            toast.error("Erro ao atualizar plano.");
            setSaving(false);
            return;
        }

        // Atualiza JWT claims
        await supabase.rpc("refresh_church_claim", {
            p_user_id: selectedUser.user_id
        });

        // Atualiza estado local
        setUsers(prev =>
            prev.map(u =>
                u.user_id === selectedUser.user_id
                    ? {
                        ...u,
                        plan_slug: values.plan_slug,
                        subscription_active: values.subscription_active
                    }
                    : u
            )
        );

        toast.success("Plano atualizado com sucesso.");
        setSaving(false);
        closeModal();
    }

    return {
        users,
        loading,
        selectedUser,
        modalOpen,
        openModal,
        closeModal,
        saveChanges,
        saving
    };
}
