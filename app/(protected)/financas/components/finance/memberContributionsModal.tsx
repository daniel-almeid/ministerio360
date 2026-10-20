"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpCircle, DollarSign } from "lucide-react";
import { fetchMemberContributions } from "../../finance/financeService";
import { formatBRL } from "../../finance/money";
import type { Contribution } from "../../finance/types";
import { ModalShell, SecondaryButton } from "./ui";

// Histórico de contribuições (dízimos, ofertas...) lançadas para o membro
export function MemberContributionsModal({
    member,
    onClose,
}: {
    member: { id: string; name: string };
    onClose: () => void;
}) {
    const [items, setItems] = useState<Contribution[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchMemberContributions(member.id)
            .then(setItems)
            .catch(() => setFailed(true));
    }, [member.id]);

    const ofYear = useMemo(
        () => (items ?? []).filter((c) => new Date(c.created_at).getFullYear() === year && c.type === "entrada"),
        [items, year]
    );
    const total = ofYear.reduce((sum, c) => sum + c.amount, 0);
    const monthsWithGift = new Set(ofYear.map((c) => new Date(c.created_at).getMonth())).size;
    const years = useMemo(() => {
        const set = new Set((items ?? []).map((c) => new Date(c.created_at).getFullYear()));
        set.add(new Date().getFullYear());
        return [...set].sort((a, b) => b - a);
    }, [items]);

    return (
        <ModalShell
            title="Contribuições"
            subtitle={member.name}
            icon={DollarSign}
            onClose={onClose}
            footer={<SecondaryButton onClick={onClose}>Fechar</SecondaryButton>}
        >
            {items === null && !failed ? (
                <p className="text-sm text-gray-500 py-6 text-center">Carregando...</p>
            ) : failed ? (
                <p className="text-sm text-red-600">Não foi possível carregar as contribuições.</p>
            ) : (
                <>
                    {years.length > 1 && (
                        <div className="flex gap-2">
                            {years.map((y) => (
                                <button
                                    key={y}
                                    onClick={() => setYear(y)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                        y === year
                                            ? "bg-[#38B2AC] border-[#38B2AC] text-white"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-[#E6FFFA] px-3 py-2">
                            <p className="text-xs text-gray-500">Total em {year}</p>
                            <p className="text-lg font-bold text-[#0F766E]">{formatBRL(total)}</p>
                        </div>
                        <div className="rounded-lg bg-[#E6FFFA] px-3 py-2">
                            <p className="text-xs text-gray-500">Meses com contribuição</p>
                            <p className="text-lg font-bold text-[#0F766E]">{monthsWithGift} de 12</p>
                        </div>
                    </div>

                    {ofYear.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            Nenhuma contribuição ligada a este membro em {year}. Ao lançar um dízimo ou oferta, escolha o
                            membro no campo “Membro”.
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {ofYear.map((c) => (
                                <div key={c.id} className="flex items-center gap-3 py-2">
                                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{c.category || "Sem categoria"}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(c.created_at).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                    <span className="font-semibold text-gray-800">{formatBRL(c.amount)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </ModalShell>
    );
}
