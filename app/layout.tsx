import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SystemGate } from "@/components/system/systemGate";

export const metadata = {
    title: "Ministério360",
    description: "Gestão ministerial moderna e integrada",
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
