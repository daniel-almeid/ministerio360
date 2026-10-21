// Funções, áreas e níveis de acesso (iguais às regras do banco)

export type Role = "pastor" | "tesoureiro" | "secretaria" | "lider";
export type Level = "none" | "view" | "edit" | "own" | "all";
export type AreaKey = "membros" | "visitantes" | "ministerios" | "agenda" | "escalas" | "financas";
export type Permissions = Record<AreaKey, Level>;

export const ROLES: Role[] = ["pastor", "tesoureiro", "secretaria", "lider"];

export const ROLE_LABEL: Record<Role, string> = {
    pastor: "Pastor",
    tesoureiro: "Tesoureiro",
    secretaria: "Secretaria",
    lider: "Líder de ministério",
};

export const ROLE_HINT: Record<Role, string> = {
    pastor: "Acesso total, inclusive aos usuários e ao plano",
    tesoureiro: "Finanças e consulta de membros",
    secretaria: "Membros, visitantes, ministérios e agenda",
    lider: "Escalas dos ministérios que lidera e agenda",
};

export const AREAS: { key: AreaKey; label: string; levels: Level[] }[] = [
    { key: "membros", label: "Membros", levels: ["none", "view", "edit"] },
    { key: "visitantes", label: "Visitantes", levels: ["none", "view", "edit"] },
    { key: "ministerios", label: "Ministérios", levels: ["none", "view", "edit"] },
    { key: "agenda", label: "Agenda", levels: ["none", "view", "edit"] },
    { key: "escalas", label: "Escalas", levels: ["none", "view", "own", "all"] },
    { key: "financas", label: "Finanças", levels: ["none", "view", "edit"] },
];

export const LEVEL_LABEL: Record<Level, string> = {
    none: "Sem acesso",
    view: "Ver",
    edit: "Editar",
    own: "Meus ministérios",
    all: "Todas",
};

export const DEFAULT_PERMISSIONS: Record<Role, Permissions> = {
    pastor: { membros: "edit", visitantes: "edit", ministerios: "edit", agenda: "edit", escalas: "all", financas: "edit" },
    tesoureiro: { membros: "view", visitantes: "none", ministerios: "none", agenda: "view", escalas: "none", financas: "edit" },
    secretaria: { membros: "edit", visitantes: "edit", ministerios: "edit", agenda: "edit", escalas: "view", financas: "none" },
    lider: { membros: "view", visitantes: "none", ministerios: "view", agenda: "edit", escalas: "own", financas: "none" },
};

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLES as string[]).includes(value);
}

// Permissões diferentes do padrão da função?
export function isCustomized(role: Role, permissions: Permissions) {
    const base = DEFAULT_PERMISSIONS[role];
    return AREAS.some(({ key }) => base[key] !== permissions[key]);
}

// Resumo curto: "Finanças · Membros (ver) · Agenda (ver)"
export function permissionsSummary(permissions: Permissions) {
    return AREAS.filter(({ key }) => permissions[key] !== "none")
        .map(({ key, label }) => {
            const level = permissions[key];
            if (level === "edit" || level === "all") return label;
            if (level === "own") return `${label} (meus ministérios)`;
            return `${label} (ver)`;
        })
        .join(" · ");
}
