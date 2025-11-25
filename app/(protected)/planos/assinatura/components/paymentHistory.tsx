"use client";

import type { PaymentItem } from "../hook/useSubscription";

type Props = {
    hasPaidPlan: boolean;
    paymentHistory: PaymentItem[];
};

export default function PaymentHistory({ hasPaidPlan, paymentHistory }: Props) {
    if (!hasPaidPlan || paymentHistory.length === 0) return null;

    return (
        <>
            <div className="h-px bg-gray-200" />

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                    Histórico recente de pagamentos
                </h3>

                <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                    <div className="grid grid-cols-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2 border-b border-gray-100">
                        <span>Data</span>
                        <span className="text-right">Valor</span>
                    </div>
                    {paymentHistory.map((p, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-2 text-sm text-gray-700 px-4 py-2 border-t border-gray-100 first:border-t-0"
                        >
                            <span>{p.date}</span>
                            <span className="text-right">
                                R$ {p.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-[11px] text-gray-400">
                    Valores estimados com base no ciclo mensal atual.
                </p>
            </div>
        </>
    );
}
