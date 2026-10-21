import { describe, expect, it } from "vitest";
import {
    AREAS,
    DEFAULT_PERMISSIONS,
    ROLES,
    isCustomized,
    isRole,
    permissionsSummary,
    type Permissions,
} from "@/app/(protected)/usuarios/users/permissions";

// Cópia exata de role_default_permissions() do banco: se um mudar, o outro precisa mudar junto
const BANCO: Record<string, Permissions> = {
    pastor: { membros: "edit", visitantes: "edit", ministerios: "edit", agenda: "edit", escalas: "all", financas: "edit" },
    tesoureiro: { membros: "view", visitantes: "none", ministerios: "none", agenda: "view", escalas: "none", financas: "edit" },
    secretaria: { membros: "edit", visitantes: "edit", ministerios: "edit", agenda: "edit", escalas: "view", financas: "none" },
    lider: { membros: "view", visitantes: "none", ministerios: "view", agenda: "edit", escalas: "own", financas: "none" },
};

describe("Permissões padrão de cada função (site)", () => {
    it("são iguais às do banco", () => {
        for (const role of ROLES) expect(DEFAULT_PERMISSIONS[role]).toEqual(BANCO[role]);
    });

    it("cobrem todas as áreas com níveis válidos", () => {
        for (const role of ROLES) {
            for (const area of AREAS) {
                expect(area.levels).toContain(DEFAULT_PERMISSIONS[role][area.key]);
            }
        }
    });

    it("só Escalas tem os níveis 'meus ministérios' e 'todas'", () => {
        for (const area of AREAS) {
            if (area.key === "escalas") expect(area.levels).toEqual(["none", "view", "own", "all"]);
            else expect(area.levels).toEqual(["none", "view", "edit"]);
        }
    });
});

describe("Personalização", () => {
    it("percebe quando as permissões foram mudadas", () => {
        expect(isCustomized("tesoureiro", { ...DEFAULT_PERMISSIONS.tesoureiro })).toBe(false);
        expect(isCustomized("tesoureiro", { ...DEFAULT_PERMISSIONS.tesoureiro, visitantes: "view" })).toBe(true);
    });

    it("resume o que a pessoa acessa", () => {
        expect(permissionsSummary(DEFAULT_PERMISSIONS.tesoureiro)).toBe("Membros (ver) · Agenda (ver) · Finanças");
        expect(permissionsSummary(DEFAULT_PERMISSIONS.lider)).toBe(
            "Membros (ver) · Ministérios (ver) · Agenda · Escalas (meus ministérios)"
        );
        expect(
            permissionsSummary({ membros: "none", visitantes: "none", ministerios: "none", agenda: "none", escalas: "none", financas: "none" })
        ).toBe("");
    });

    it("reconhece só funções válidas", () => {
        expect(isRole("pastor")).toBe(true);
        expect(isRole("admin")).toBe(false);
        expect(isRole(undefined)).toBe(false);
    });
});
