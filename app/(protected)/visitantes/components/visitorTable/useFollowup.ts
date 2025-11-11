"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFollowup() {
    const [processingId, setProcessingId] = useState<string | null>(null);

    async function handleFollowup(v: any) {
        try {
            setProcessingId(v.id);

            const { error } = await supabase
                .from("visitors")
                .update({ followup_status: "em_andamento" })
                .eq("id", v.id);

            if (error) throw error;

            if (v.phone) {
                const phone = v.phone.replace(/\D/g, "");
                const msg = encodeURIComponent(
                    `Olá ${v.name}, tudo bem? Aqui é da nossa igreja. Estamos muito felizes por sua visita! Gostaríamos de manter contato e saber como foi sua experiência. 🙏`
                );
                window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
            } else {
                alert("Este visitante não possui número de telefone cadastrado.");
            }

            if (v.email) {
                await fetch("/api/sendFollowupEmail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ to: v.email, name: v.name }),
                });
            }

            alert("Follow-up iniciado com sucesso!");
        } catch (err) {
            console.error("Erro ao iniciar follow-up:", err);
            alert("Erro ao iniciar follow-up. Verifique e tente novamente.");
        } finally {
            setProcessingId(null);
        }
    }

    return { processingId, handleFollowup };
}
