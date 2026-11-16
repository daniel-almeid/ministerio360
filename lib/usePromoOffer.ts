"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { promoActive, promoEligible, type PromoChurch } from "@/lib/promo";

// Área logada: a igreja de quem está logado pode usar a Black Friday agora?
// (o servidor confere de novo antes de cobrar)
export function usePromoOffer(): boolean {
    const [offer, setOffer] = useState(false);

    useEffect(() => {
        if (!promoActive()) return;
        let alive = true;
        (async () => {
            const { data: access } = await supabase.rpc("my_access");
            const churchId = (access as { church_id?: string } | null)?.church_id;
            if (!churchId) return;
            const { data } = await supabase
                .from("church_profiles")
                .select("pagarme_subscription_id, pagarme_customer_id, billing_provider")
                .eq("id", churchId)
                .maybeSingle<PromoChurch>();
            if (alive && data) setOffer(promoEligible(data));
        })().catch(() => {});
        return () => {
            alive = false;
        };
    }, []);

    return offer;
}

// Páginas públicas (conta nova sempre pode usar): só confere a data.
// Depois de montar a tela, para o HTML gerado no build não divergir do navegador.
export function usePromoActive(): boolean {
    const [on, setOn] = useState(false);
    useEffect(() => {
        setOn(promoActive());
    }, []);
    return on;
}
