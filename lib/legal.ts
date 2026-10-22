// =====================================================================
// Dados legais do Ministério360 — fonte única para Termos, Política e aceite.
// Ao mudar os Termos ou a Política, atualize VERSION e UPDATED_AT.
// =====================================================================

export const LEGAL = {
    // Versão dos documentos (gravada na conta de quem aceita)
    VERSION: "2026-10-22",
    UPDATED_AT: "22 de outubro de 2026",

    PRODUCT: "Ministério360",
    SITE: "https://ministerio360.vercel.app",
    EMAIL: "danielandrade_2001@hotmail.com",

    // Responsável pelo serviço e controlador dos dados das contas
    CONTROLLER: {
        NAME: "DANIEL ALMEIDA ANDRADE",
        DOCUMENT: "59.046.511/0001-97",
        LOCATION: "Nova Iguaçu/RJ",
    },

    // Encarregado pelo tratamento de dados (LGPD, art. 41)
    DPO_NAME: "Daniel Almeida Andrade",
} as const;

// Gravado nos dados da conta ao criar o acesso (prova do aceite)
export function legalAcceptance() {
    return { terms_version: LEGAL.VERSION, terms_accepted_at: new Date().toISOString() };
}
