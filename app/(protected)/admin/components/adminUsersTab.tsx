"use client";

import { useMemo, useState } from "react";
import { Church, Clock, Pause, Pencil, Play, Search, ShieldCheck, Trash2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { UserFormModal } from "../../usuarios/components/userFormModal";
import { ConfirmModal } from "../../usuarios/components/confirmModal";
import { ROLE_LABEL, isCustomized, permissionsSummary } from "../../usuarios/users/permissions";
import type { ChurchUser } from "../../usuarios/users/usersService";
import {
    adminErrorMessage,
    adminRemoveUser,
    adminRevokeInvite,
    adminSetStatus,
    adminUpdateUser,
    fetchChurchMinistries,
    useAdminUsers,
    type AdminChurchUser,
    type AdminInvite,
} from "../hook/useAdminUsers";

const PLAN_LABEL: Record<string, string> = {
    free: "Grátis",
    standard: "Standard",
    premium_basic: "Premium",
    premium: "Premium+",
};

type Filter = "all" | "pastor" | "team" | "paused" | "none";
const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "pastor", label: "Pastores" },
    { value: "team", label: "Equipe" },
    { value: "paused", label: "Pausados" },
    { value: "none", label: "Sem igreja" },
];

type Confirm =
    | { kind: "pause" | "remove"; user: AdminChurchUser }
    | { kind: "revoke"; invite: AdminInvite }
    | null;

function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleDateString("pt-BR") : "nunca";
}

function daysLeft(value: string) {
    const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
    return days <= 1 ? "vence hoje" : `vence em ${days} dias`;
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
    return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${className}`}>{children}</span>;
}

// Aba "Usuários" do painel Admin: todas as pessoas de todas as igrejas
export default function AdminUsersTab({ enabled }: { enabled: boolean }) {
    const { users, invites, loading, loaded, error, reload } = useAdminUsers(enabled);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const [editing, setEditing] = useState<{ user: AdminChurchUser; ministries: { id: string; name: string }[] } | null>(null);
    const [opening, setOpening] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<Confirm>(null);

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        return users
            .filter(
                (u) =>
                    !s ||
                    u.name.toLowerCase().includes(s) ||
                    u.email.toLowerCase().includes(s) ||
                    (u.church_name ?? "").toLowerCase().includes(s)
            )
            .filter((u) => {
                if (filter === "pastor") return u.role === "pastor";
                if (filter === "team") return !!u.role && u.role !== "pastor";
                if (filter === "paused") return u.status === "paused";
                if (filter === "none") return !u.id;
                return true;
            });
    }, [users, search, filter]);

    const totals = useMemo(
        () => [
            { label: "Usuários", value: users.length },
            { label: "Igrejas", value: new Set(users.map((u) => u.church_id).filter(Boolean)).size },
            { label: "Pausados", value: users.filter((u) => u.status === "paused").length },
            { label: "Convites pendentes", value: invites.length },
        ],
        [users, invites]
    );

    async function openEdit(user: AdminChurchUser) {
        if (!user.church_id) return;
        setOpening(user.user_id);
        try {
            const ministries = await fetchChurchMinistries(user.church_id);
            setEditing({ user, ministries });
        } catch (err) {
            toast.error(adminErrorMessage(err, "Não foi possível abrir o usuário."));
        } finally {
            setOpening(null);
        }
    }

    async function reactivate(user: AdminChurchUser) {
        try {
            await adminSetStatus(user.id!, "active");
            toast.success(`${user.name.split(" ")[0]} pode acessar de novo.`);
            void reload();
        } catch (err) {
            toast.error(adminErrorMessage(err, "Não foi possível reativar."));
        }
    }

    // O formulário usa o formato da tela do Pastor
    const editUser: ChurchUser | null = editing
        ? {
              id: editing.user.id!,
              user_id: editing.user.user_id,
              name: editing.user.name,
              email: editing.user.email,
              role: editing.user.role!,
              permissions: editing.user.permissions!,
              ministry_ids: editing.user.ministry_ids,
              member_id: editing.user.member_id,
              member_name: null,
              status: editing.user.status ?? "active",
              created_at: editing.user.created_at,
              last_sign_in_at: editing.user.last_sign_in_at,
              is_me: editing.user.is_me,
          }
        : null;

    return (
        <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {totals.map((t) => (
                    <div key={t.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                        <p className="text-xs text-gray-500">{t.label}</p>
                        <p className="text-xl font-semibold text-gray-800">{loaded ? t.value : "–"}</p>
                    </div>
                ))}
            </div>

            {/* Busca e filtros */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar nome, e-mail ou igreja..."
                        className="pl-9 pr-3 py-2 border rounded-lg w-full bg-gray-50 focus:bg-white transition text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                                filter === f.value
                                    ? "bg-[#E6FFFA] border-[#38B2AC] text-[#0F766E]"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-red-700">Não foi possível carregar os usuários.</p>
                    <button
                        onClick={() => void reload()}
                        className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800"
                    >
                        Tentar de novo
                    </button>
                </div>
            )}

            {/* Lista */}
            <section className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                {!loaded || (loading && users.length === 0) ? (
                    <p className="p-6 text-sm text-gray-500">Carregando...</p>
                ) : filtered.length === 0 ? (
                    <p className="p-6 text-sm text-center text-gray-400">Nenhum usuário encontrado.</p>
                ) : (
                    filtered.map((u) => {
                        const locked = u.is_me || u.is_platform_admin;
                        return (
                            <div key={u.user_id} className="p-4 md:px-6 flex flex-col md:flex-row md:items-center gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                            u.status === "paused" ? "bg-gray-100 text-gray-400" : "bg-[#E6FFFA] text-[#0F766E]"
                                        }`}
                                    >
                                        {initials(u.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                                            <span className="truncate">{u.name}</span>
                                            {u.is_me && <span className="text-[11px] font-semibold text-gray-400">(você)</span>}
                                            {u.role && (
                                                <Badge
                                                    className={
                                                        u.role === "pastor" ? "bg-[#1E3A5F] text-white" : "bg-[#E6FFFA] text-[#0F766E]"
                                                    }
                                                >
                                                    {ROLE_LABEL[u.role]}
                                                </Badge>
                                            )}
                                            {u.is_owner && <Badge className="bg-indigo-50 text-indigo-700">Titular</Badge>}
                                            {u.is_platform_admin && <Badge className="bg-amber-100 text-amber-800">Admin</Badge>}
                                            {u.status === "paused" && <Badge className="bg-amber-50 text-amber-700">Pausado</Badge>}
                                            {u.role && u.role !== "pastor" && u.permissions && isCustomized(u.role, u.permissions) && (
                                                <Badge className="bg-gray-100 text-gray-600">Personalizado</Badge>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">{u.email}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                                            <Church className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">
                                                {u.church_name ?? "Sem igreja (cadastro incompleto)"}
                                                {u.church_id ? ` · ${PLAN_LABEL[u.plan_slug] ?? u.plan_slug}` : ""}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                                            {u.role && u.role !== "pastor" && u.permissions
                                                ? `${permissionsSummary(u.permissions) || "Sem acesso a áreas"} · `
                                                : ""}
                                            Criado em {formatDate(u.created_at)} · Último acesso: {formatDate(u.last_sign_in_at)}
                                        </p>
                                    </div>
                                </div>

                                {u.id && !locked && (
                                    <div className="flex items-center gap-2 md:shrink-0">
                                        <IconButton
                                            title="Editar acesso"
                                            disabled={opening === u.user_id}
                                            onClick={() => void openEdit(u)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </IconButton>
                                        {u.status === "active" ? (
                                            <IconButton title="Pausar acesso" onClick={() => setConfirm({ kind: "pause", user: u })}>
                                                <Pause className="w-4 h-4" />
                                            </IconButton>
                                        ) : (
                                            <IconButton title="Reativar acesso" onClick={() => void reactivate(u)}>
                                                <Play className="w-4 h-4" />
                                            </IconButton>
                                        )}
                                        <IconButton title="Remover" danger onClick={() => setConfirm({ kind: "remove", user: u })}>
                                            <Trash2 className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                )}
                                {locked && (
                                    <p className="text-xs text-gray-400 inline-flex items-center gap-1 md:shrink-0">
                                        <ShieldCheck className="w-4 h-4" /> {u.is_me ? "Sua conta" : "Administrador"}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </section>

            {/* Convites pendentes de todas as igrejas */}
            {invites.length > 0 && (
                <section className="bg-white rounded-2xl border border-gray-100">
                    <h4 className="px-6 pt-5 pb-2 text-sm font-semibold text-gray-700">Convites pendentes</h4>
                    <div className="divide-y divide-gray-100">
                        {invites.map((i) => (
                            <div key={i.id} className="px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800 truncate flex items-center gap-2">
                                            {i.name || i.email || ROLE_LABEL[i.role]}
                                            <Badge className="bg-[#E6FFFA] text-[#0F766E]">{ROLE_LABEL[i.role]}</Badge>
                                        </p>
                                        <p className={`text-xs ${i.expired ? "text-red-600" : "text-gray-500"}`}>
                                            {i.church_name ?? "-"} · {i.expired ? "Expirado" : daysLeft(i.expires_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="md:shrink-0">
                                    <IconButton title="Cancelar convite" danger onClick={() => setConfirm({ kind: "revoke", invite: i })}>
                                        <XCircle className="w-4 h-4" />
                                    </IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {editing && editUser && (
                <UserFormModal
                    mode="edit"
                    user={editUser}
                    ministries={editing.ministries}
                    showMember={false}
                    onClose={() => setEditing(null)}
                    onSubmit={async (input) => {
                        try {
                            await adminUpdateUser(editUser.id, {
                                role: input.role,
                                permissions: input.permissions,
                                ministry_ids: input.ministry_ids,
                            });
                            toast.success("Acesso atualizado.");
                            setEditing(null);
                            void reload();
                            return null;
                        } catch (err) {
                            return adminErrorMessage(err, "Não foi possível salvar.");
                        }
                    }}
                />
            )}

            {confirm?.kind === "pause" && (
                <ConfirmModal
                    title="Pausar acesso"
                    text={`${confirm.user.name} (${confirm.user.church_name ?? "-"}) não consegue ver nem alterar nada até ser reativado.`}
                    confirmLabel="Pausar"
                    onClose={() => setConfirm(null)}
                    onConfirm={async () => {
                        try {
                            await adminSetStatus(confirm.user.id!, "paused");
                            toast.success("Acesso pausado.");
                            setConfirm(null);
                            void reload();
                            return null;
                        } catch (err) {
                            return adminErrorMessage(err, "Não foi possível pausar.");
                        }
                    }}
                />
            )}

            {confirm?.kind === "remove" && (
                <ConfirmModal
                    title="Remover usuário"
                    text={`A conta de ${confirm.user.name} é excluída e o acesso acaba na hora. Os dados da igreja continuam.${
                        confirm.user.is_owner ? " Como é o titular, a igreja passa para outro Pastor ativo." : ""
                    }`}
                    confirmLabel="Remover"
                    danger
                    onClose={() => setConfirm(null)}
                    onConfirm={async () => {
                        try {
                            await adminRemoveUser(confirm.user.id!);
                            toast.success("Usuário removido.");
                            setConfirm(null);
                            void reload();
                            return null;
                        } catch (err) {
                            return adminErrorMessage(err, "Não foi possível remover.");
                        }
                    }}
                />
            )}

            {confirm?.kind === "revoke" && (
                <ConfirmModal
                    title="Cancelar convite"
                    text={`O link deixa de funcionar e a vaga da ${confirm.invite.church_name ?? "igreja"} fica livre.`}
                    confirmLabel="Cancelar convite"
                    danger
                    onClose={() => setConfirm(null)}
                    onConfirm={async () => {
                        try {
                            await adminRevokeInvite(confirm.invite.id);
                            toast.success("Convite cancelado.");
                            setConfirm(null);
                            void reload();
                            return null;
                        } catch (err) {
                            return adminErrorMessage(err, "Não foi possível cancelar.");
                        }
                    }}
                />
            )}
        </div>
    );
}

function IconButton({
    title,
    onClick,
    danger,
    disabled,
    children,
}: {
    title: string;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            title={title}
            aria-label={title}
            onClick={onClick}
            disabled={disabled}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition disabled:opacity-50 ${
                danger
                    ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
        >
            {children}
        </button>
    );
}
