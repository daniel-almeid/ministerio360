"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";

type Props = {
    hasPaidPlan: boolean;
    onCancel: () => void;
};

export default function FooterActions({ hasPaidPlan, onCancel }: Props) {
    return (
        <>
            <div className="h-px bg-gray-200" />

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                <div className="flex-1 flex flex-col gap-2">
                    {hasPaidPlan ? (
                        <>
                            <button
                                onClick={onCancel}
                                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-red-600 transition shadow-sm"
                            >
                                Cancelar assinatura
                            </button>

                            <Link
                                href="/planos"
                                className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white text-xs sm:text-sm rounded-lg font-semibold hover:bg-teal-700 transition shadow-sm text-center"
                            >
                                Alterar plano
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/planos"
                            className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white text-xs sm:text-sm rounded-lg font-semibold hover:bg-teal-700 transition shadow-sm text-center"
                        >
                            Contratar um plano
                        </Link>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-2 text-xs text-gray-600 sm:text-right">
                    <div className="flex items-center gap-2 sm:justify-end">
                        <HelpCircle className="w-4 h-4 text-gray-500" />
                        <span>Precisa de ajuda com sua assinatura?</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                        <Link
                            href="mailto:suporte@ministerio360.com"
                            className="px-3 py-1.5 text-[11px] sm:text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-center"
                        >
                            Falar com suporte
                        </Link>
                        <Link
                            href="/configuracoes"
                            className="px-3 py-1.5 text-[11px] sm:text-xs rounded-lg border border-teal-500 text-teal-700 hover:bg-teal-50 transition text-center"
                        >
                            Atualizar dados de cobrança
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
