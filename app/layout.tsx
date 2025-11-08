// app/layout.tsx
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
