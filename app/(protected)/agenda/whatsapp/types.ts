export type ScaleResponseStatus = "confirmed" | "declined" | "pending";

// Uma pessoa escalada (aparece uma vez só, mesmo que sirva em mais de um ministério)
export type ScalePerson = {
    memberId: string;
    name: string;
    phone: string | null;
    whatsapp: string | null; // número pronto para o WhatsApp (null = sem telefone válido)
    ministries: string[];
    token: string | null; // código do link de confirmação de presença
    status: ScaleResponseStatus;
    respondedAt: string | null;
    source: string | null; // "leader" quando o líder marcou à mão
    note: string | null;
};

export type ScaleShareData = {
    id: string;
    date: string;
    event: string;
    responsible: string;
    people: ScalePerson[];
    byMinistry: { ministry: string; members: string[] }[];
};
