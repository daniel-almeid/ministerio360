"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Lock, RotateCcw, UserCog, UserPlus } from "lucide-react";
import { Field, ModalShell, PrimaryButton, SecondaryButton, inputClass } from "../../financas/components/finance/ui";
import { MemberPicker } from "../../financas/components/finance/fields";
import type { MemberOption } from "../../financas/finance/types";
import {
    AREAS,
    DEFAULT_PERMISSIONS,
    LEVEL_LABEL,
    ROLES,
    ROLE_HINT,
    ROLE_LABEL,
    isCustomized,
    type Permissions,
    type Role,
} from "../users/permissions";
import type { ChurchUser, UserInput } from "../users/usersService";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
    mode: "invite" | "edit";
    user?: ChurchUser | null; // edição
    ministries: { id: string; name: string }[];
    onClose: () => void;
    onSubmit: (input: UserInput & { name: string | null; email: string | null }) => Promise<string | null>; // devolve erro
};

// Convidar ou editar usuário: função, ministérios, membro ligado e permissões
export function UserFormModal({ mode, user, ministries, onClose, onSubmit }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<Role>(user?.role ?? "tesoureiro");
    const [permissions, setPermissions] = useState<Permissions>(user?.permissions ?? DEFAULT_PERMISSIONS.tesoureiro);
    const [ministryIds, setMinistryIds] = useState<string[]>(user?.ministry_ids ?? []);
    const [member, setMember] = useState<MemberOption | null>(
        user?.member_id ? { id: user.member_id, name: user.member_name ?? "Membro" } : null
    );
    const [showPermissions, setShowPermissions] = useState(!!user && isCustomized(user.role, user.permissions));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPastor = role === "pastor";
    const needsMinistries = permissions.escalas === "own";

    useEffect(() => {
        function esc(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [onClose]);

    function chooseRole(next: Role) {
        setRole(next);
        setPermissions(DEFAULT_PERMISSIONS[next]);
        if (next !== "lider") setMinistryIds([]);
    }

    function toggleMinistry(id: string) {
        setMinistryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    async function submit() {
        setError(null);
        const cleanEmail = email.trim().toLowerCase();

        if (mode === "invite" && cleanEmail && !EMAIL.test(cleanEmail)) {
            return setError("Confira o e-mail digitado.");
        }
        if (needsMinistries && ministryIds.length === 0) {
            return setError("Escolha ao menos um ministério que a pessoa lidera.");
        }

        setSaving(true);
        const message = await onSubmit({
            role,
            permissions: isPastor ? DEFAULT_PERMISSIONS.pastor : permissions,
            ministry_ids: needsMinistries ? ministryIds : [],
            member_id: member?.id ?? null,
            name: mode === "invite" ? name.trim() || member?.name || null : null,
            email: mode === "invite" ? cleanEmail || null : null,
        });
        setSaving(false);
        if (message) setError(message);
    }

    return (
        <ModalShell
            title={mode === "invite" ? "Convidar usuário" : "Editar usuário"}
            subtitle={mode === "invite" ? "A pessoa recebe um link para criar a senha" : user?.name}
            icon={mode === "invite" ? UserPlus : UserCog}
            onClose={onClose}
            error={error}
            wide
            footer={
                <>
                    <SecondaryButton onClick={onClose} disabled={saving}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton onClick={submit} loading={saving}>
                        {mode === "invite" ? "Criar convite" : "Salvar"}
                    </PrimaryButton>
                </>
            }
        >
            {mode === "invite" && (
                <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Nome (opcional)">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex.: Maria Souza"
                            className={inputClass}
                            maxLength={120}
                        />
                    </Field>
                    <Field label="E-mail (opcional)">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="maria@email.com"
                            className={inputClass}
                        />
                    </Field>
                    <p className="sm:col-span-2 -mt-1 text-xs text-gray-500">
                        Com e-mail preenchido, só esse e-mail consegue usar o convite.
                    </p>
                </div>
            )}

            <Field label="Função">
                <div className="grid sm:grid-cols-2 gap-2">
                    {ROLES.map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => chooseRole(r)}
                            className={`text-left rounded-xl border px-3 py-2.5 transition ${
                                role === r
                                    ? "border-[#38B2AC] bg-[#E6FFFA] ring-1 ring-[#38B2AC]"
                                    : "border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            <p className={`text-sm font-semibold ${role === r ? "text-[#0F766E]" : "text-gray-800"}`}>
                                {ROLE_LABEL[r]}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{ROLE_HINT[r]}</p>
                        </button>
                    ))}
                </div>
            </Field>

            {needsMinistries && (
                <Field label="Ministérios que lidera">
                    {ministries.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum ministério cadastrado ainda.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {ministries.map((m) => {
                                const active = ministryIds.includes(m.id);
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => toggleMinistry(m.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                                            active
                                                ? "bg-[#38B2AC] border-[#38B2AC] text-white"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        {m.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </Field>
            )}

            <Field label="Membro ligado" hint="Ligue a pessoa ao cadastro dela em Membros (opcional).">
                <MemberPicker value={member} onChange={setMember} />
            </Field>

            {/* Permissões por área */}
            <div className="rounded-xl border border-gray-200">
                <button
                    type="button"
                    onClick={() => setShowPermissions((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                    <span>
                        <span className="block text-sm font-semibold text-gray-700">O que pode acessar</span>
                        <span className="block text-xs text-gray-500">
                            {isPastor
                                ? "Pastor tem acesso total"
                                : isCustomized(role, permissions)
                                ? "Personalizado"
                                : `Padrão de ${ROLE_LABEL[role]}`}
                        </span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition ${showPermissions ? "rotate-180" : ""}`} />
                </button>

                {showPermissions && (
                    <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                        {isPastor ? (
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> O Pastor sempre pode tudo, inclusive gerenciar usuários.
                            </p>
                        ) : (
                            <>
                                {AREAS.map((area) => (
                                    <div key={area.key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                                        <span className="text-sm text-gray-700 sm:w-28 shrink-0">{area.label}</span>
                                        <div className="flex flex-wrap gap-1">
                                            {area.levels.map((level) => {
                                                const active = permissions[area.key] === level;
                                                return (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        onClick={() => setPermissions((p) => ({ ...p, [area.key]: level }))}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                                                            active
                                                                ? level === "none"
                                                                    ? "bg-gray-700 border-gray-700 text-white"
                                                                    : "bg-[#38B2AC] border-[#38B2AC] text-white"
                                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {LEVEL_LABEL[level]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {isCustomized(role, permissions) && (
                                    <button
                                        type="button"
                                        onClick={() => setPermissions(DEFAULT_PERMISSIONS[role])}
                                        className="text-xs font-semibold text-[#0F766E] inline-flex items-center gap-1 hover:underline"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Voltar ao padrão de {ROLE_LABEL[role]}
                                    </button>
                                )}
                                <p className="text-xs text-gray-400">
                                    Quem tem acesso à Agenda vê todos os eventos, para evitar conflitos de data.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </ModalShell>
    );
}
