"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Clock,
    Link2,
    Lock,
    Pause,
    Pencil,
    Play,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users,
    XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/components/shared/loading";
import { useHeaderData } from "../../../components/shared/header/useHeaderData";
import { UserFormModal } from "./components/userFormModal";
import { InviteLinkModal } from "./components/inviteLinkModal";
import { ConfirmModal } from "./components/confirmModal";
import { ROLE_LABEL, isCustomized, permissionsSummary } from "./users/permissions";
import {
    createInvite,
    fetchInvites,
    fetchMinistries,
    fetchMyAccess,
    fetchSeats,
    fetchUsers,
    inviteLink,
    inviteMessage,
    removeUser,
    revokeInvite,
    setUserStatus,
    updateUser,
    usersErrorMessage,
    type ChurchInvite,
    type ChurchUser,
    type SeatInfo,
} from "./users/usersService";

const PLAN_LABEL: Record<string, string> = {
    free: "Grátis",
    standard: "Standard",
    premium_basic: "Premium",
    premium: "Premium+",
};

function formatDate(value: string | null) {
    if (!value) return "nunca";
    const d = new Date(value);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function daysLeft(value: string) {
    const ms = new Date(value).getTime() - Date.now();
    const days = Math.ceil(ms / 86400000);
    return days <= 1 ? "vence hoje" : `vence em ${days} dias`;
}

function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export default function UsuariosPage() {
    const { churchName } = useHeaderData();
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const [users, setUsers] = useState<ChurchUser[]>([]);
    const [invites, setInvites] = useState<ChurchInvite[]>([]);
    const [seats, setSeats] = useState<SeatInfo | null>(null);
    const [ministries, setMinistries] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const [inviting, setInviting] = useState(false);
    const [editing, setEditing] = useState<ChurchUser | null>(null);
    const [linkFor, setLinkFor] = useState<{ token: string; who: string; role: string } | null>(null);
    const [confirm, setConfirm] = useState<
        | { kind: "remove"; user: ChurchUser }
        | { kind: "pause"; user: ChurchUser }
        | { kind: "revoke"; invite: ChurchInvite }
        | null
    >(null);

    const load = useCallback(async () => {
        try {
            const [u, i, s, m] = await Promise.all([fetchUsers(), fetchInvites(), fetchSeats(), fetchMinistries()]);
            setUsers(u);
            setInvites(i);
            setSeats(s);
            setMinistries(m);
        } catch (err) {
            toast.error(usersErrorMessage(err, "Não foi possível carregar os usuários."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyAccess().then((access) => {
            const ok = access?.role === "pastor" && access.status === "active";
            setAllowed(ok);
            if (ok) load();
            else setLoading(false);
        });
    }, [load]);

    const ministryName = useMemo(() => new Map(ministries.map((m) => [m.id, m.name])), [ministries]);
    const full = !!seats && seats.limit !== null && seats.used >= seats.limit;

    if (loading || allowed === null) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <Loading />
            </div>
        );
    }

    if (!allowed) {
        return (
            <section className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-gray-700">Somente o Pastor gerencia os usuários</h2>
                <p className="text-sm text-gray-500 mt-1">Fale com o pastor da sua igreja se precisar de outro acesso.</p>
            </section>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {/* Cabeçalho */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#38B2AC]" /> Usuários da igreja
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Cada pessoa entra com o próprio e-mail e vê só o que você liberar.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {seats && (
                            <div className="text-right">
                                <p className={`text-sm font-semibold ${full ? "text-amber-700" : "text-gray-700"}`}>
                                    {seats.limit === null ? `${seats.used} usuários` : `${seats.used} de ${seats.limit} usuários`}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Plano {PLAN_LABEL[seats.plan] ?? seats.plan}
                                    {seats.limit === null ? " · ilimitado" : ""}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => setInviting(true)}
                            disabled={full}
                            title={full ? "Limite de usuários do plano atingido" : undefined}
                            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm"
                        >
                            <UserPlus className="w-4 h-4" /> Convidar
                        </button>
                    </div>
                </div>

                {full && (
                    <p className="mt-4 text-sm rounded-lg bg-amber-50 text-amber-800 px-3 py-2">
                        Você atingiu o limite de usuários do seu plano. Para convidar mais pessoas, cancele um convite
                        pendente, remova alguém ou mude de plano.
                    </p>
                )}
            </section>

            {/* Usuários */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {users.map((u) => (
                    <div key={u.id} className="p-4 md:px-6 flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                    u.status === "paused" ? "bg-gray-100 text-gray-400" : "bg-[#E6FFFA] text-[#0F766E]"
                                }`}
                            >
                                {initials(u.name)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate flex items-center gap-2 flex-wrap">
                                    {u.name}
                                    {u.is_me && <span className="text-[11px] font-semibold text-gray-400">(você)</span>}
                                    <span
                                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                            u.role === "pastor" ? "bg-[#1E3A5F] text-white" : "bg-[#E6FFFA] text-[#0F766E]"
                                        }`}
                                    >
                                        {ROLE_LABEL[u.role]}
                                    </span>
                                    {u.status === "paused" && (
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                            Pausado
                                        </span>
                                    )}
                                    {u.role !== "pastor" && isCustomized(u.role, u.permissions) && (
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            Personalizado
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500 truncate">{u.email}</p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                    {u.role === "pastor" ? "Acesso total" : permissionsSummary(u.permissions) || "Sem acesso a áreas"}
                                    {u.ministry_ids.length > 0 &&
                                        ` · Lidera: ${u.ministry_ids.map((id) => ministryName.get(id) ?? "—").join(", ")}`}
                                    {u.member_name && ` · Membro: ${u.member_name}`}
                                    {` · Último acesso: ${formatDate(u.last_sign_in_at)}`}
                                </p>
                            </div>
                        </div>

                        {!u.is_me && (
                            <div className="flex items-center gap-2 md:shrink-0">
                                <IconButton title="Editar acesso" onClick={() => setEditing(u)}>
                                    <Pencil className="w-4 h-4" />
                                </IconButton>
                                {u.status === "active" ? (
                                    <IconButton title="Pausar acesso" onClick={() => setConfirm({ kind: "pause", user: u })}>
                                        <Pause className="w-4 h-4" />
                                    </IconButton>
                                ) : (
                                    <IconButton
                                        title="Reativar acesso"
                                        onClick={async () => {
                                            try {
                                                await setUserStatus(u.id, "active");
                                                toast.success(`${u.name.split(" ")[0]} pode acessar de novo.`);
                                                load();
                                            } catch (err) {
                                                toast.error(usersErrorMessage(err, "Não foi possível reativar."));
                                            }
                                        }}
                                    >
                                        <Play className="w-4 h-4" />
                                    </IconButton>
                                )}
                                <IconButton title="Remover" danger onClick={() => setConfirm({ kind: "remove", user: u })}>
                                    <Trash2 className="w-4 h-4" />
                                </IconButton>
                            </div>
                        )}
                        {u.is_me && (
                            <p className="text-xs text-gray-400 inline-flex items-center gap-1 md:shrink-0">
                                <ShieldCheck className="w-4 h-4" /> Sua conta
                            </p>
                        )}
                    </div>
                ))}
            </section>

            {/* Convites pendentes */}
            {invites.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="px-6 pt-5 pb-2 text-sm font-semibold text-gray-700">Convites pendentes</h4>
                    <div className="divide-y divide-gray-100">
                        {invites.map((i) => {
                            const who = i.name || i.member_name || i.email || ROLE_LABEL[i.role];
                            return (
                                <div key={i.id} className="px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-800 truncate">
                                                {who}{" "}
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E6FFFA] text-[#0F766E]">
                                                    {ROLE_LABEL[i.role]}
                                                </span>
                                            </p>
                                            <p className={`text-xs ${i.expired ? "text-red-600" : "text-gray-500"}`}>
                                                {i.email && i.email !== who ? `${i.email} · ` : ""}
                                                {i.expired ? "Expirado — cancele e crie outro" : daysLeft(i.expires_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:shrink-0">
                                        {!i.expired && (
                                            <button
                                                onClick={() => setLinkFor({ token: i.token, who, role: ROLE_LABEL[i.role] })}
                                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5"
                                            >
                                                <Link2 className="w-4 h-4" /> Enviar link
                                            </button>
                                        )}
                                        <IconButton title="Cancelar convite" danger onClick={() => setConfirm({ kind: "revoke", invite: i })}>
                                            <XCircle className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Modais */}
            {inviting && (
                <UserFormModal
                    mode="invite"
                    ministries={ministries}
                    onClose={() => setInviting(false)}
                    onSubmit={async (input) => {
                        try {
                            const invite = await createInvite(input);
                            setInviting(false);
                            setLinkFor({
                                token: invite.token,
                                who: input.name || input.email || ROLE_LABEL[input.role],
                                role: ROLE_LABEL[input.role],
                            });
                            load();
                            return null;
                        } catch (err) {
                            return usersErrorMessage(err, "Não foi possível criar o convite.");
                        }
                    }}
                />
            )}

            {editing && (
                <UserFormModal
                    mode="edit"
                    user={editing}
                    ministries={ministries}
                    onClose={() => setEditing(null)}
                    onSubmit={async (input) => {
                        try {
                            await updateUser(editing.id, input);
                            toast.success("Acesso atualizado.");
                            setEditing(null);
                            load();
                            return null;
                        } catch (err) {
                            return usersErrorMessage(err, "Não foi possível salvar.");
                        }
                    }}
                />
            )}

            {linkFor && (
                <InviteLinkModal
                    link={inviteLink(linkFor.token)}
                    message={inviteMessage(churchName, linkFor.role, inviteLink(linkFor.token))}
                    who={linkFor.who}
                    onClose={() => setLinkFor(null)}
                />
            )}

            {confirm?.kind === "remove" && (
                <ConfirmModal
                    title="Remover usuário"
                    text={`${confirm.user.name} perde o acesso na hora e a conta dele(a) é excluída. Os lançamentos e cadastros que ele(a) fez continuam na igreja. Se precisar, você pode convidar de novo depois.`}
                    confirmLabel="Remover"
                    danger
                    onClose={() => setConfirm(null)}
                    onConfirm={async () => {
                        try {
                            await removeUser(confirm.user.id);
                            toast.success("Usuário removido.");
                            setConfirm(null);
                            load();
                            return null;
                        } catch (err) {
                            return usersErrorMessage(err, "Não foi possível remover.");
                        }
                    }}
                />
            )}

            {confirm?.kind === "pause" && (
                <ConfirmModal
                    title="Pausar acesso"
                    text={`${confirm.user.name} não consegue mais ver nem alterar nada da igreja até você reativar. A conta e as permissões continuam guardadas.`}
                    confirmLabel="Pausar"
                    onClose={() => setConfirm(null)}
                    onConfirm={async () => {
                        try {
                            await setUserStatus(confirm.user.id, "paused");
                            toast.success("Acesso pausado.");
                            setConfirm(null);
                            load();
                            return null;
                        } catch (err) {
                            return usersErrorMessage(err, "Não foi possível pausar.");
                        }
                    }}
                />
            )}

            {confirm?.kind === "revoke" && (
                <ConfirmModal
                    title="Cancelar convite"
                    text="O link deixa de funcionar e a vaga fica livre de novo."
                    confirmLabel="Cancelar convite"
                    danger
                    onClose={() => setConfirm(null)}
                    onConfirm={async () => {
                        try {
                            await revokeInvite(confirm.invite.id);
                            toast.success("Convite cancelado.");
                            setConfirm(null);
                            load();
                            return null;
                        } catch (err) {
                            return usersErrorMessage(err, "Não foi possível cancelar.");
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
    children,
}: {
    title: string;
    onClick: () => void;
    danger?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            title={title}
            aria-label={title}
            onClick={onClick}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition ${
                danger
                    ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
        >
            {children}
        </button>
    );
}
