"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Lock, PauseCircle, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useMyAccess } from "./useMyAccess";

// Mostra a página só se o usuário tiver acesso a ela
export function AccessGate({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { loading, paused, access, canOpen } = useMyAccess();

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh] text-gray-500">Carregando...</div>;
    }

    if (paused) {
        return (
            <Blocked
                icon={<PauseCircle className="w-7 h-7 text-gray-500" />}
                title="Seu acesso está pausado"
                text="O pastor da sua igreja pausou o seu acesso. Fale com ele para voltar a usar o Ministério360."
                action={
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = "/login";
                        }}
                        className="px-5 py-2.5 rounded-lg bg-[#38B2AC] hover:bg-[#319795] text-white font-semibold"
                    >
                        Sair da conta
                    </button>
                }
            />
        );
    }

    if (!access) {
        return (
            <Blocked
                icon={<WifiOff className="w-7 h-7 text-gray-500" />}
                title="Não foi possível carregar"
                text="Verifique sua internet e recarregue a página."
                action={
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 rounded-lg bg-[#38B2AC] hover:bg-[#319795] text-white font-semibold"
                    >
                        Recarregar
                    </button>
                }
            />
        );
    }

    if (!canOpen(pathname)) {
        return (
            <Blocked
                icon={<Lock className="w-7 h-7 text-gray-500" />}
                title="Você não tem acesso a esta área"
                text="Se precisar, peça ao pastor para liberar o acesso na tela de Usuários."
                action={
                    <a
                        href="/dashboard"
                        className="px-5 py-2.5 rounded-lg bg-[#38B2AC] hover:bg-[#319795] text-white font-semibold"
                    >
                        Ir para o início
                    </a>
                }
            />
        );
    }

    return <>{children}</>;
}

function Blocked({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action: ReactNode }) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center text-center gap-3 max-w-xl mx-auto mt-8">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">{icon}</div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 max-w-sm">{text}</p>
            <div className="mt-2">{action}</div>
        </section>
    );
}
