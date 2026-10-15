
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast from "react-hot-toast";

export const ADMIN_ID = "289d49c4-8db0-49e2-b527-af90809f3be8";

export type AdminUser = {
    user_id: string;
    user_name: string | null;
    email: string;
    created_at_user: string;
    church_id: string | null;
    church_name: string | null;
    created_at_church: string | null;
    plan_slug: string;
    subscription_active: boolean;
};

type PlanValues = {
    plan_slug: string;
    subscription_active: boolean;
};

export function useAdmin(enabled: boolean) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: rpcError } =
                await supabase.rpc("admin_list_users");

            if (rpcError) {
                throw rpcError;
            }

            setUsers((data ?? []) as AdminUser[]);
        } catch (err) {
            console.error("Admin: erro ao carregar usuários", err);

            const message =
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar os usuários.";

            setError(message);
            toast.error("Erro ao carregar usuários.");
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    }, [enabled]);

    useEffect(() => {
        if (enabled) {
            void load();
        }
    }, [enabled, load]);

    const openModal = useCallback((user: AdminUser) => {
        setSelectedUser(user);
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedUser(null);
        setModalOpen(false);
    }, []);

    const saveChanges = useCallback(
        async (values: PlanValues) => {
            if (!selectedUser?.church_id) {
                toast.error(
                    "Este usuário ainda não tem uma igreja vinculada."
                );
                return;
            }

            setSaving(true);

            try {
                const { error: rpcError } = await supabase.rpc(
                    "admin_set_plan",
                    {
                        p_church_id: selectedUser.church_id,
                        p_plan_slug: values.plan_slug,
                        p_subscription_active: values.subscription_active,
                    }
                );

                if (rpcError) {
                    throw rpcError;
                }

                setUsers((previous) =>
                    previous.map((user) =>
                        user.user_id === selectedUser.user_id
                            ? {
                                  ...user,
                                  plan_slug: values.plan_slug,
                                  subscription_active:
                                      values.subscription_active,
                              }
                            : user
                    )
                );

                toast.success("Plano atualizado com sucesso.");
                closeModal();
            } catch (err) {
                console.error("Admin: erro ao atualizar plano", err);
                toast.error("Erro ao atualizar plano.");
            } finally {
                setSaving(false);
            }
        },
        [selectedUser, closeModal]
    );

    return {
        users,
        loading,
        loaded,
        error,
        selectedUser,
        modalOpen,
        openModal,
        closeModal,
        saveChanges,
        saving,
        refresh: load,
    };
}
