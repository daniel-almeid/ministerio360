import { describe, expect, it } from "vitest";
import { describeMember, normalizeMemberName, sameNameWarning } from "@/lib/memberNames";

const maria = { id: "1", name: "Maria Souza", phone: "(11) 99999-8888", birth_date: "1990-03-05", is_active: true };

describe("Membros com o mesmo nome", () => {
    it("compara ignorando maiúsculas e espaços", () => {
        expect(normalizeMemberName("  maria   SOUZA ")).toBe("maria souza");
        expect(normalizeMemberName(null)).toBe("");
    });

    it("descreve o membro para ajudar a identificar", () => {
        expect(describeMember(maria)).toBe("tel. (11) 99999-8888 · nasc. 05/03/1990");
        expect(describeMember({ ...maria, phone: null, birth_date: null, is_active: false })).toBe("inativo");
        expect(describeMember({ ...maria, phone: null, birth_date: null })).toBe("sem telefone nem data de nascimento");
    });

    it("sem homônimos, sem aviso", () => {
        expect(sameNameWarning("Maria Souza", [])).toBeNull();
    });

    it("um homônimo", () => {
        const msg = sameNameWarning("  Maria   Souza ", [maria])!;
        expect(msg).toContain('Já existe um membro chamado "Maria Souza" nesta igreja');
        expect(msg).toContain("tel. (11) 99999-8888");
        expect(msg).toContain("salve de novo para confirmar");
    });

    it("vários homônimos (mostra no máximo 3)", () => {
        const lista = [1, 2, 3, 4].map((n) => ({ ...maria, id: String(n), phone: `tel${n}` }));
        const msg = sameNameWarning("Maria Souza", lista)!;
        expect(msg).toContain("Já existem 4 membros chamados");
        expect(msg).toContain("tel3");
        expect(msg).not.toContain("tel4");
    });
});
