// app/layout.tsx
import './globals.css';

export const metadata = {
    title: 'Ministério360',
    description: 'Gestão ministerial moderna e integrada',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}