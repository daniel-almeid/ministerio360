"use client";

import { PROMO } from "@/lib/promo";
import { usePromoActive } from "@/lib/usePromoOffer";

// Faixa da Black Friday no alto da página inicial (some sozinha fora do período)
export default function PromoBar() {
    const on = usePromoActive();
    if (!on) return null;
    return (
        <a
            href="#planos"
            data-ph="home_faixa_black_friday"
            className="block bg-[#F4B942] px-4 py-2 text-center text-sm font-semibold text-[#13324F] hover:bg-[#F7C865] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#13324F]"
        >
            {PROMO.name} até {PROMO.lastDayLabel}: {PROMO.percent.yearly}% off no anual ou {PROMO.percent.monthly}% off no 1º mês
            <span className="hidden sm:inline"> · Ver planos</span>
        </a>
    );
}
