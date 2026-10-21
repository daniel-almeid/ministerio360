"use client";

import { useState } from "react";
import { usePlan } from "./hook/usePlan";
import Loading from "@/components/shared/loading";
import PlanCard from "./components/planCard";
import PlanFooter from "./components/planFooter";
import CycleToggle from "./components/cycleToggle";
import { PLANS, type BillingCycle } from "@/lib/plans";

export default function PlanosPage() {
    const { loading, currentPlan, active } = usePlan();
    const [cycle, setCycle] = useState<BillingCycle>("monthly");

    if (loading) return <Loading />;

    return (
        <div className="max-w-7xl mx-auto px-2 py-4 space-y-8">
            <h1 className="text-4xl font-bold text-gray-800 text-center">
                Escolha seu plano
            </h1>

            <p className="text-center text-gray-600 max-w-2xl mx-auto">
                Atualize seu plano para desbloquear mais funcionalidades no Ministério360.
            </p>

            <CycleToggle value={cycle} onChange={setCycle} />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {PLANS.map((plan) => (
                    <PlanCard
                        key={plan.slug}
                        plan={plan}
                        cycle={cycle}
                        current={currentPlan}
                        active={active && currentPlan === plan.slug}
                    />
                ))}
            </div>

            <PlanFooter />
        </div>
    );
}
