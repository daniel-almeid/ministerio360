"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Quem já entrou nesta aba vai direto para o painel, como antes
export default function SessionRedirect() {
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) router.replace("/dashboard");
        });
    }, [router]);

    return null;
}
