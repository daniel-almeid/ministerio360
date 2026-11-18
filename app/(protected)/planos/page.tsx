"use client";

import { useEffect, useState } from "react";
import { usePlan } from "./hook/usePlan";
import Loading from "@/components/shared/loading";
import PlanCard from "./components/planCard";
import PlanFooter from "./components/planFooter";
import CycleToggle from "./components/cycleToggle";
import { PLANS, type BillingCycle } from "@/lib/plans";
import { Smartphone } from "lucide-react";
import { usePromoOffer } from "@/lib/usePromoOffer";
import { PROMO } from "@/lib/promo";

export default function PlanosPage() {
    const { loading, currentPlan, active, paysThroughStore } = usePlan();
    const [cycle, setCycle] = useState<BillingCycle>("monthly");
    const promo = usePromoOffer();

    // Veio do login com um plano escolhido no cadastro e ainda sem pagamento:
    // abre direto o pagamento desse plano (no ciclo escolhido no cadastro)
    const [payNow, setPayNow] = useState(false);
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("pagar") !== "1") return;
        setPayNow(true);
        try {
            if (localStorage.getItem("m360_ciclo_escolhido") === "yearly") setCycle("yearly");
        } catch {}
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="max-w-7xl mx-auto px-2 py-4 space-y-8">
            <h1 className="text-4xl font-bold text-gray-800 text-center">
                Escolha seu plano
            </h1>

            <p className="text-center text-gray-600 max-w-2xl mx-auto">
                Atualize seu plano para desbloquear mais funcionalidades no Ministério360.
            </p>

            {paysThroughStore && (
                <div className="max-w-2xl mx-auto flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                    <Smartphone className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-sm leading-relaxed">
                        <strong>A assinatura da sua igreja é feita pela Google Play.</strong> Para mudar de plano ou
                        cancelar, use o aplicativo ou a Google Play. Assinar aqui pelo cartão cobraria duas vezes.
                    </p>
                </div>
            )}

            {promo && (
                <div className="max-w-2xl mx-auto rounded-2xl bg-[#13324F] px-5 py-4 text-center text-white">
                    <p className="font-bold text-[#F4B942]">{PROMO.name} até {PROMO.lastDayLabel}</p>
                    <p className="text-sm text-white/85 mt-1">
                        {PROMO.percent.yearly}% off no plano anual ou {PROMO.percent.monthly}% off no 1º mês do mensal.
                    </p>
                </div>
            )}

            <CycleToggle value={cycle} onChange={setCycle} />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {PLANS.map((plan) => (
                    <PlanCard
                        key={plan.slug}
                        plan={plan}
                        cycle={cycle}
                        current={currentPlan}
                        active={active && currentPlan === plan.slug}
                        locked={paysThroughStore}
                        promo={promo}
                        autoOpen={payNow && !active && !paysThroughStore && currentPlan === plan.slug}
                    />
                ))}
            </div>

            <PlanFooter />
        </div>
    );
}
