import type { MetadataRoute } from "next";
import { RESOURCES, SITE_URL } from "@/lib/seo";

// Mapa do site para o Google: só páginas públicas
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/recursos`, changeFrequency: "weekly", priority: 0.9 },
        ...RESOURCES.map((r) => ({
            url: `${SITE_URL}/recursos/${r.slug}`,
            lastModified: r.updated,
            changeFrequency: "monthly" as const,
            priority: r.kind === "ferramenta" ? 0.8 : 0.7,
        })),
        { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.5 },
        { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.2 },
        { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ];
}
