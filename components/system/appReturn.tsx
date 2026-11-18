"use client";

import { useEffect } from "react";

// Quem criou a conta pelo aplicativo confirma o e-mail num link que abre o navegador.
// Aqui o site percebe isso (a conta leva a marca origem = "app") e manda a pessoa de volta ao app.
// O endereço é lido assim que o arquivo carrega, antes de o login automático limpar o link.
const INITIAL_HASH = typeof window !== "undefined" ? window.location.hash : "";

export function cameFromApp(hash: string): boolean {
    try {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        if (params.get("type") !== "signup") return false;
        const payload = params.get("access_token")?.split(".")[1];
        if (!payload) return false;
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const text = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join(""),
        );
        return JSON.parse(text)?.user_metadata?.origem === "app";
    } catch {
        return false;
    }
}

export function AppReturn() {
    useEffect(() => {
        if (window.location.pathname.startsWith("/abrir-app")) return;
        if (cameFromApp(INITIAL_HASH)) window.location.replace("/abrir-app");
    }, []);
    return null;
}
