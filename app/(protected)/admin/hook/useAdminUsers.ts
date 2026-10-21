"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Permissions, Role } from "../../usuarios/users/permissions";

// Usuário de qualquer igreja (visão do Admin)
export type AdminChurchUser = {
    id: string | null; // vínculo com a igreja; null = conta sem igreja
    user_id: string;
    name: string;
    email: string;
    church_id: string | null;
    church_name: string | null;
    plan_slug: string;
    is_owner: boolean;
    role: Role | null;
    permissions: Permissions | null;
    ministry_ids: string[];
    member_id: string | null;
    status: "active" | "paused" | null;
    created_at: string;
    last_sign_in_at: string | null;
    is_me: boolean;
    is_platform_admin: boolean;
};

export type AdminInvite = {
    id: string;
    token: string;
    church_id: string;
    church_name: string | null;
    role: Role;
    name: string | null;
    email: string | null;
    created_at: string;
    expires_at: string;
    expired: boolean;
};

export function adminErrorMessage(error: any, fallback: string) {
    if (error?.code === "42501") return "Somente o administrador pode fazer isso.";
    if (["P0001", "P0002", "22023"].includes(error?.code)) return String(error?.message || fallback);
    return fallback;
}

export async function fetchChurchMinistries(churchId: string) {
    const { data, error } = await supabase.rpc("admin_church_ministries", { p_church_id: churchId });
    if (error) throw error;
    return (data ?? []) as { id: string; name: string }[];
}

export async function adminUpdateUser(id: string, input: { role: Role; permissions: Permissions; ministry_ids: string[] }) {
    const { error } = await supabase.rpc("admin_update_church_user", {
        p_id: id,
        p_role: input.role,
        p_permissions: input.permissions,
        p_ministry_ids: input.ministry_ids,
    });
    if (error) throw error;
}

export async function adminSetStatus(id: string, status: "active" | "paused") {
    const { error } = await supabase.rpc("admin_set_church_user_status", { p_id: id, p_status: status });
    if (error) throw error;
}

export async function adminRemoveUser(id: string) {
    const { error } = await supabase.rpc("admin_remove_church_user", { p_id: id });
    if (error) throw error;
}

export async function adminRevokeInvite(id: string) {
    const { error } = await supabase.rpc("admin_revoke_invite", { p_id: id });
    if (error) throw error;
}

// Usuários e convites de todas as igrejas (só carrega quando a aba abre)
export function useAdminUsers(enabled: boolean) {
    const [users, setUsers] = useState<AdminChurchUser[]>([]);
    const [invites, setInvites] = useState<AdminInvite[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const [u, i] = await Promise.all([
                supabase.rpc("admin_list_all_users"),
                supabase.rpc("admin_list_all_invites"),
            ]);
            if (u.error) throw u.error;
            if (i.error) throw i.error;
            setUsers((u.data ?? []) as AdminChurchUser[]);
            setInvites((i.data ?? []) as AdminInvite[]);
        } catch (err) {
            console.error("Admin: erro ao carregar usuários", err);
            setError(true);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (enabled && !loaded) void reload();
    }, [enabled, loaded, reload]);

    return { users, invites, loading, loaded, error, reload };
}
