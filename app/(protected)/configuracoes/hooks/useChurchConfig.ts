"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChurchFormData, INITIAL_FORM } from "../types/churchConfig";
import toast from "react-hot-toast";

export function useChurchConfig() {
    const [formData, setFormData] = useState<ChurchFormData>(INITIAL_FORM);
    const [churchId, setChurchId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadChurchData();
    }, []);


    // Carrega dados da igreja
    async function loadChurchData() {
        setLoading(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const church_id = sessionData.session?.user?.app_metadata?.church_id;
            if (!church_id) throw new Error("Church ID não encontrado no JWT.");
            setChurchId(church_id);

            const { data, error, status } = await supabase
                .from("church_institutional_info")
                .select("*")
                .eq("church_id", church_id)
                .maybeSingle();

            if (error) {
                if (status === 406)
                    toast.error("⚠️ Supabase ainda sincronizando. Tente novamente em alguns segundos.");
                else console.warn("Erro ao carregar dados:", error.message);
                return;
            }

            setFormData({ ...INITIAL_FORM, ...data });
        } catch (err: any) {
            console.error("Erro ao carregar dados:", err.message);
            toast.error("Erro ao carregar dados da igreja.");
        } finally {
            setLoading(false);
        }
    }

    // Salva alterações

    async function saveChurchData() {
        if (!churchId) return;
        setSaving(true);

        // Mostra toast de carregamento
        const savingToast = toast.loading("Salvando informações...");

        try {
            const { error } = await supabase
                .from("church_institutional_info")
                .upsert({ church_id: churchId, ...formData }, { onConflict: "church_id" });

            if (error) throw error;

            // Atualiza toast existente para sucesso
            toast.success("Informações salvas com sucesso!", { id: savingToast });
            await loadChurchData();
        } catch (err: any) {
            console.error(err);
            toast.error("Erro ao salvar: " + err.message, { id: savingToast });
        } finally {
            setSaving(false);
        }
    }

    // Atualiza campos
    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    return { formData, handleChange, loading, saving, saveChurchData };
}
