"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { RetryButton, StateScreen, stateButtonOutline } from "@/components/system/stateScreen";
import { LEGAL } from "@/lib/legal";

// "Algo deu errado": quando uma página do site quebra por um erro inesperado
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    const code = error.digest ? error.digest.slice(0, 8).toUpperCase() : null;

    return (
        <StateScreen
            icon={AlertTriangle}
            tone="red"
            title="Algo deu errado"
            text="Esta página teve um problema inesperado. Seus dados estão seguros."
            footer={
                <p className="mt-6 text-[13px] leading-relaxed text-slate-400">
                    Se continuar acontecendo, fale com o suporte:{" "}
                    <a
                        href={`mailto:${LEGAL.EMAIL}?subject=${encodeURIComponent(`Erro no site${code ? ` (${code})` : ""}`)}`}
                        className="font-semibold text-[#0F766E] hover:underline"
                    >
                        {LEGAL.EMAIL}
                    </a>
                    {code && <span className="block">Código do erro: {code}</span>}
                </p>
            }
        >
            <RetryButton onClick={reset} />
            <Link href="/dashboard" className={stateButtonOutline}>
                Voltar ao Dashboard
            </Link>
        </StateScreen>
    );
}
