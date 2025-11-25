"use client";

import { Calendar, CreditCard } from "lucide-react";

type Props = {
    hasPaidPlan: boolean;
    formattedLastPayment: string | null;
    formattedNextPayment: string | null;
    progressPercent: number | null;
};

export default function BillingCycle({
    hasPaidPlan,
    formattedLastPayment,
    formattedNextPayment,
    progressPercent,
}: Props) {
    if (!hasPaidPlan) return null;

    return (
        <>
            <div className="h-px bg-gray-200" />

            <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-700">
                    Ciclo de cobrança
                </h3>

                <div className="space-y-3">
                    {formattedLastPayment && (
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span>
                                Último pagamento em{" "}
                                <span className="font-medium">
                                    {formattedLastPayment}
                                </span>
                            </span>
                        </div>
                    )}

                    {formattedNextPayment && (
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>
                                Próxima cobrança em{" "}
                                <span className="font-medium">
                                    {formattedNextPayment}
                                </span>
                            </span>
                        </div>
                    )}

                    {progressPercent !== null && (
                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between text-[11px] text-gray-500 uppercase tracking-wide">
                                <span>Ciclo atual</span>
                                <span>{progressPercent}% utilizado</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full bg-teal-500 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            {formattedLastPayment && formattedNextPayment && (
                                <div className="flex justify-between text-[11px] text-gray-400">
                                    <span>{formattedLastPayment}</span>
                                    <span>{formattedNextPayment}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
