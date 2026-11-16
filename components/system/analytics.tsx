"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

// Conta as páginas vistas e os cliques em botões marcados com data-ph="nome"
export function Analytics() {
    const pathname = usePathname();

    useEffect(() => {
        track("$pageview");
    }, [pathname]);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            const el = (e.target as HTMLElement | null)?.closest?.("[data-ph]");
            const name = el?.getAttribute("data-ph");
            if (name) track("clique", { alvo: name });
        }
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);

    return null;
}
