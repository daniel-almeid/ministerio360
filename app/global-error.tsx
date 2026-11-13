"use client";

import "./globals.css";
import ErrorPage from "./error";

// Erro no próprio layout principal: a mesma tela "Algo deu errado", com html/body próprios
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="pt-BR">
            <body>
                <ErrorPage error={error} reset={reset} />
            </body>
        </html>
    );
}
