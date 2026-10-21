// =====================================================================
// Membros com o mesmo nome: a igreja pode ter dois "Maria Souza",
// mas o sistema avisa antes de cadastrar (pode ser a mesma pessoa).
// =====================================================================

export type SameNameMember = {
    id: string;
    name: string;
    phone: string | null;
    birth_date: string | null; // "AAAA-MM-DD"
    is_active: boolean;
};

// "  maria   SOUZA " -> "maria souza"
export function normalizeMemberName(name: string | null | undefined) {
    return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function birthBR(iso: string | null) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

// "tel. (11) 99999-8888 · nasc. 05/03/1990 · inativo"
export function describeMember(m: SameNameMember) {
    const parts = [
        m.phone ? `tel. ${m.phone}` : null,
        birthBR(m.birth_date) ? `nasc. ${birthBR(m.birth_date)}` : null,
        m.is_active ? null : "inativo",
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : "sem telefone nem data de nascimento";
}

// Texto do aviso mostrado no formulário
export function sameNameWarning(name: string, matches: SameNameMember[]) {
    if (matches.length === 0) return null;
    const shown = name.trim().replace(/\s+/g, " ");
    const head =
        matches.length === 1
            ? `Já existe um membro chamado "${shown}" nesta igreja`
            : `Já existem ${matches.length} membros chamados "${shown}" nesta igreja`;
    const details = matches.slice(0, 3).map(describeMember).join("; ");
    return `${head} (${details}). Confira se não é a mesma pessoa. Se for outra pessoa, salve de novo para confirmar.`;
}
