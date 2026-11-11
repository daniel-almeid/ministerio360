export default function PublicLayout({ children }: { children: React.ReactNode }) {
    // Cada tela de entrada monta o próprio fundo (verde da marca + área branca)
    return <div className="min-h-screen">{children}</div>;
}
