"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { printReceipt } from "./receiptService";

type Transaction = {
    id: string;
    type: string;
    category: string | null;
    amount: number | string;
    person_name?: string | null;
    created_at: string;
};

// Recibo: só para entrada com o nome de quem contribuiu (mesma regra do app)
export function hasReceipt(t: Transaction) {
    return t.type === "entrada" && !!t.person_name?.trim();
}

export function ReceiptButton({ transaction: t, className = "" }: { transaction: Transaction; className?: string }) {
    const [busy, setBusy] = useState(false);

    if (!hasReceipt(t)) return null;

    async function open() {
        if (busy) return;
        setBusy(true);
        try {
            await printReceipt({
                id: t.id,
                personName: t.person_name ?? "",
                category: t.category,
                amount: Number(t.amount),
                date: t.created_at,
            });
        } catch {
            toast.error("Não foi possível gerar o recibo. Tente novamente.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={open}
            disabled={busy}
            title="Recibo do lançamento"
            aria-label="Recibo do lançamento"
            className={`text-[#0F766E] hover:text-[#0D5C56] transition disabled:opacity-60 ${className}`}
        >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        </button>
    );
}
