// Campos que a importação entende
export type ImportField = "name" | "phone" | "email" | "birth_date" | "ministry" | "status";

// Situação de cada linha depois da conferência
//  ok        -> entra como está
//  warning   -> entra, mas algum dado foi deixado em branco (ex.: data inválida)
//  duplicate -> não entra: já existe membro com esse nome (no app ou repetido na planilha)
//  error     -> não entra: falta o nome
export type ImportRowStatus = "ok" | "warning" | "duplicate" | "error";

export type ImportRow = {
    line: number; // linha na planilha (como o usuário vê no Excel)
    status: ImportRowStatus;
    issues: string[];
    data: {
        name: string;
        phone: string | null;
        email: string | null;
        birth_date: string | null; // "YYYY-MM-DD"
        ministry_id: string | null; // preenchido quando o ministério já existe no app
        ministry_name: string | null; // nome do ministério (o novo será criado com este nome)
        is_active: boolean;
    };
};

export type ImportPreview = {
    fileName: string;
    columns: Partial<Record<ImportField, string>>; // campo -> título da coluna encontrada
    ignoredColumns: string[];
    newMinistries: string[]; // ministérios da planilha que ainda não existem e serão criados
    rows: ImportRow[];
    counts: Record<ImportRowStatus, number>;
};

export type MinistryOption = { id: string; name: string };

export type ImportResult = {
    imported: number;
    createdMinistries: string[];
    ministryErrors: string[]; // ministérios que não foi possível criar (membros entram sem ministério)
    failed: { line: number; name: string; reason: string }[];
    skipped: number; // duplicados + erros
};
