import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// O que o Google pode ler: a parte pública. A área logada, os links pessoais
// (confirmação de escala, convites) e a API ficam de fora.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/confirmar/",
                "/convite/",
                "/excluir-conta",
                "/dashboard",
                "/membros",
                "/visitantes",
                "/ministries",
                "/agenda",
                "/financas",
                "/relatorios",
                "/planos",
                "/usuarios",
                "/configuracoes",
                "/admin",
                "/indique",
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
