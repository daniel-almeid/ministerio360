"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

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

            if (!v.phone) {
                toast("Este visitante não possui número de telefone cadastrado.", {
                    icon: "⚠️",
                    style: { background: "#f59e0b", color: "#fff" },
                });
                return;
            }

            const phone = v.phone.replace(/\D/g, "");
            const visitDate = v.visit_date
                ? format(new Date(v.visit_date), "dd/MM/yyyy", { locale: ptBR })
                : "data não informada";

            const msg = `
Olá ${v.name}! 😊
Aqui é da nossa igreja. Ficamos muito felizes com sua visita no dia ${visitDate}.
Gostaríamos de manter contato e saber como foi sua experiência conosco.
Deus abençoe você e sua família! 🙏
            `.trim();

            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");

            toast.success(`Follow-up com ${v.name} iniciado com sucesso!`);
            return { ...v, followup_status: "em_andamento" };
        } catch (err) {
            console.error("Erro ao iniciar follow-up:", err);
            toast.error("Erro ao iniciar follow-up. Verifique e tente novamente.");
        } finally {
            setProcessingId(null);
        }
    }

    async function handleFinish(v: any) {
        try {
            setProcessingId(v.id);

            const { error } = await supabase
                .from("visitors")
                .update({ followup_status: "concluido" })
                .eq("id", v.id);

            if (error) throw error;

            toast.success(`Follow-up de ${v.name} concluído com sucesso!`);
            return { ...v, followup_status: "concluido" };
        } catch (err) {
            console.error("Erro ao finalizar follow-up:", err);
            toast.error("Erro ao finalizar follow-up. Verifique e tente novamente.");
        } finally {
            setProcessingId(null);
        }
    }

    return { processingId, handleFollowup, handleFinish };
}
