"use client";

import { useEffect } from "react";
import { saveReferralCode } from "@/lib/referral";

// Chegou por um link de indicação (?indicacao=K7M2QX): guarda o código para o cadastro
export default function ReferralCapture() {
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("indicacao");
        if (code) saveReferralCode(code);
    }, []);
    return null;
}
