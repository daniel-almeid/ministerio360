// Endereço público do site e lista das páginas de Recursos (usadas no mapa do site, na página
// de Recursos e nos "veja também"). Se um dia o site ganhar domínio próprio, troque SITE_URL.
export const SITE_URL = "https://ministerio360.vercel.app";

export type Resource = {
    slug: string;
    kind: "ferramenta" | "guia";
    title: string; // título da página (também vai para o Google)
    card: string; // texto curto do cartão
    description: string; // descrição para o Google (até ~155 caracteres)
    updated: string; // AAAA-MM-DD
};

export const RESOURCES: Resource[] = [
    {
        slug: "recibo-de-dizimo",
        kind: "ferramenta",
        title: "Modelo de recibo de dízimo e oferta grátis (PDF)",
        card: "Preencha na tela e imprima ou salve em PDF. Com o valor por extenso.",
        description:
            "Gere um recibo de dízimo ou oferta pronto para imprimir ou salvar em PDF, com valor por extenso. Grátis e sem cadastro.",
        updated: "2026-11-16",
    },
    {
        slug: "ficha-de-cadastro-de-membro",
        kind: "ferramenta",
        title: "Ficha de cadastro de membro da igreja para imprimir",
        card: "Modelo pronto, com o nome da sua igreja e autorização de uso dos dados.",
        description:
            "Modelo de ficha de cadastro de membro para igrejas, com o nome da sua igreja e a autorização de uso dos dados (LGPD). Grátis para imprimir.",
        updated: "2026-11-16",
    },
    {
        slug: "como-organizar-a-tesouraria-da-igreja",
        kind: "guia",
        title: "Como organizar a tesouraria da igreja: guia prático",
        card: "Contas, categorias, recibos, conferência do culto e prestação de contas.",
        description:
            "Passo a passo para organizar a tesouraria da igreja: contas separadas, categorias, conferência das ofertas, recibos e prestação de contas mensal.",
        updated: "2026-11-16",
    },
    {
        slug: "escala-de-louvor",
        kind: "guia",
        title: "Como fazer a escala do louvor sem conflito",
        card: "Montagem, rodízio, confirmação de presença e substituições.",
        description:
            "Como montar a escala do louvor e de outros ministérios sem conflito: rodízio justo, prazo de confirmação, substituições e comunicação com a equipe.",
        updated: "2026-11-16",
    },
];

export function resourceUrl(slug: string) {
    return `/recursos/${slug}`;
}

export function getResource(slug: string) {
    const r = RESOURCES.find((x) => x.slug === slug);
    if (!r) throw new Error(`Recurso não encontrado: ${slug}`);
    return r;
}

// Base comum do Open Graph (siteName, idioma e imagem de compartilhamento),
// porque o openGraph de uma página substitui o do layout inteiro
export const OG_BASE = {
    siteName: "Ministério360",
    locale: "pt_BR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ministério360: a gestão completa da sua igreja no celular" }],
};
