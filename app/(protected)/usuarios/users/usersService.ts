import { supabase } from "@/lib/supabaseClient";
import type { Permissions, Role } from "./permissions";

export type ChurchUser = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    role: Role;
    permissions: Permissions;
    ministry_ids: string[];
    member_id: string | null;
    member_name: string | null;
    status: "active" | "paused";
    created_at: string;
    last_sign_in_at: string | null;
    is_me: boolean;
};

export type ChurchInvite = {
    id: string;
    token: string;
    role: Role;
    permissions: Permissions;
    ministry_ids: string[];
    member_id: string | null;
    member_name: string | null;
    name: string | null;
    email: string | null;
    created_at: string;
    expires_at: string;
    expired: boolean;
};

export type SeatInfo = { plan: string; limit: number | null; used: number };

export type MyAccess = {
    platform_admin: boolean;
    church_id: string | null;
    role: Role | null;
    status: "active" | "paused" | null;
    permissions: Permissions | null;
    ministry_ids: string[] | null;
    member_id: string | null;
};

export type UserInput = {
    role: Role;
    permissions: Permissions;
    ministry_ids: string[];
    member_id: string | null;
};

// Mensagem amigável para os erros do banco
export function usersErrorMessage(error: any, fallback: string) {
    const message = String(error?.message ?? "");
    if (error?.code === "42501") return "Somente o Pastor pode gerenciar usuários.";
    if (error?.code === "P0001" || error?.code === "22023" || error?.code === "P0002") return message || fallback;
    return fallback;
}

export async function fetchMyAccess(): Promise<MyAccess | null> {
    const { data, error } = await supabase.rpc("my_access");
    if (error) return null;
    return data as MyAccess;
}

export async function fetchUsers(): Promise<ChurchUser[]> {
    const { data, error } = await supabase.rpc("list_church_users");
    if (error) throw error;
    return (data ?? []) as ChurchUser[];
}

export async function fetchInvites(): Promise<ChurchInvite[]> {
    const { data, error } = await supabase.rpc("list_church_invites");
    if (error) throw error;
    return (data ?? []) as ChurchInvite[];
}

export async function fetchSeats(): Promise<SeatInfo> {
    const { data, error } = await supabase.rpc("church_seat_info");
    if (error) throw error;
    return data as SeatInfo;
}

export async function fetchMinistries(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase.from("ministries").select("id, name").order("name");
    if (error) throw error;
    return data ?? [];
}

export async function createInvite(input: UserInput & { name: string | null; email: string | null }) {
    const { data, error } = await supabase.rpc("create_church_invite", {
        p_role: input.role,
        p_permissions: input.permissions,
        p_ministry_ids: input.ministry_ids,
        p_member_id: input.member_id,
        p_name: input.name,
        p_email: input.email,
    });
    if (error) throw error;
    return data as { id: string; token: string; expires_at: string };
}

export async function revokeInvite(id: string) {
    const { error } = await supabase.rpc("revoke_church_invite", { p_id: id });
    if (error) throw error;
}

export async function updateUser(id: string, input: UserInput) {
    const { error } = await supabase.rpc("update_church_user", {
        p_id: id,
        p_role: input.role,
        p_permissions: input.permissions,
        p_ministry_ids: input.ministry_ids,
        p_member_id: input.member_id,
    });
    if (error) throw error;
}

export async function setUserStatus(id: string, status: "active" | "paused") {
    const { error } = await supabase.rpc("set_church_user_status", { p_id: id, p_status: status });
    if (error) throw error;
}

export async function removeUser(id: string) {
    const { error } = await supabase.rpc("remove_church_user", { p_id: id });
    if (error) throw error;
}

export function inviteLink(token: string) {
    return `${window.location.origin}/convite/${token}`;
}

export function inviteMessage(churchName: string | null, roleLabel: string, link: string) {
    const church = churchName?.trim() ? ` da *${churchName.trim()}*` : "";
    return [
        `Olá! 👋 Você foi convidado(a) para acessar o Ministério360${church} como *${roleLabel}*.`,
        "",
        "Crie sua senha neste link (vale por 7 dias):",
        link,
    ].join("\n");
}
