import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SystemGate } from "@/components/system/systemGate";

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const DESCRIPTION =
    "Sistema de gestão para igrejas: membros, visitantes, dízimos e ofertas com recibo, escalas com confirmação pelo WhatsApp, agenda e Ministério Infantil. Comece grátis.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: "Ministério360 · Gestão para igrejas", template: "%s · Ministério360" },
    description: DESCRIPTION,
    applicationName: "Ministério360",
    openGraph: {
        type: "website",
        locale: "pt_BR",
        siteName: "Ministério360",
        title: "Ministério360 · Gestão para igrejas",
        description: DESCRIPTION,
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ministério360: a gestão completa da sua igreja no celular" }],
    },
    twitter: { card: "summary_large_image" },
    // Código do Google Search Console (Vercel › Settings › Environment Variables)
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
        ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
        : undefined,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body suppressHydrationWarning>
                {children}
                {/* Manutenção, instabilidade e avisos de conexão (por cima de tudo) */}
                <SystemGate />
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#0d9488",
                            color: "#fff",
                            fontWeight: "500",
                        },
                        success: { iconTheme: { primary: "#fff", secondary: "#0d9488" } },
                        error: {
                            style: { background: "#dc2626" },
                            iconTheme: { primary: "#fff", secondary: "#dc2626" },
                        },
                    }}
                />
            </body>
        </html>
    );
}
