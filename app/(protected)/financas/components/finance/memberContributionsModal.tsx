"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpCircle, DollarSign, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchMemberContributions } from "../../finance/financeService";
import { formatBRL } from "../../finance/money";
import type { Contribution } from "../../finance/types";
import { printAnnualStatement, printReceipt } from "../../receipts/receiptService";
import { ModalShell, PrimaryButton, SecondaryButton } from "./ui";

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
    // Qual PDF está sendo gerado: "informe" ou o id do lançamento
    const [busy, setBusy] = useState<string | null>(null);

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

    async function run(key: string, task: () => Promise<void>) {
        if (busy) return;
        setBusy(key);
        try {
            await task();
        } catch {
            toast.error("Não foi possível gerar o PDF. Tente novamente.");
        } finally {
            setBusy(null);
        }
    }

    const statement = () => run("informe", () => printAnnualStatement(member, year));
    const receipt = (c: Contribution) =>
        run(c.id, () =>
            printReceipt({ id: c.id, personName: member.name, category: c.category, amount: Number(c.amount), date: c.created_at })
        );

    return (
        <ModalShell
            title="Contribuições"
            subtitle={member.name}
            icon={DollarSign}
            onClose={onClose}
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Fechar</SecondaryButton>
                    {ofYear.length > 0 && (
                        <PrimaryButton onClick={statement} loading={busy === "informe"} disabled={!!busy}>
                            {busy !== "informe" && <FileText className="w-4 h-4" />}
                            Informe de {year}
                        </PrimaryButton>
                    )}
                </>
            }
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
                                    <button
                                        type="button"
                                        onClick={() => receipt(c)}
                                        disabled={!!busy}
                                        title="Recibo"
                                        aria-label={`Recibo de ${c.category || "contribuição"} de ${new Date(c.created_at).toLocaleDateString("pt-BR")}`}
                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#0F766E] hover:bg-[#E6FFFA] disabled:opacity-60"
                                    >
                                        {busy === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </ModalShell>
    );
}
