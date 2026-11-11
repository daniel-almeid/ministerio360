"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Info, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

export type PendingReferral = {
    id: string;
    reward_note: string | null;
    reward_due_at: string | null;
    referrer_church: string;
    referrer_email: string | null;
    referrer_church_id: string;
    plan_slug: string | null;
    billing_cycle: string | null;
    billing_provider: string | null;
    referred_church: string;
};

const PLAN: Record<string, string> = { free: "Grátis", standard: "Padrão", premium_basic: "Premium", premium: "Premium+" };
const PROVIDER: Record<string, string> = {
    google_play: "Google Play",
    app_store: "App Store",
    pagarme: "site (cartão)",
    bonus: "mês grátis",
};

function planLine(r: PendingReferral) {
    const plan = PLAN[r.plan_slug ?? "free"] ?? r.plan_slug;
    const cycle = r.billing_cycle === "yearly" ? "anual" : "mensal";
    const by = r.billing_provider ? ` · ${PROVIDER[r.billing_provider] ?? r.billing_provider}` : "";
    return `${plan} ${cycle}${by}`;
}

// Prêmios de indicação que não saíram sozinhos: o admin dá o prêmio na mão e marca aqui (igual ao app)
export default function AdminReferralsTab({ enabled }: { enabled: boolean }) {
    const [items, setItems] = useState<PendingReferral[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [resolving, setResolving] = useState<PendingReferral | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const { data, error } = await supabase.rpc("admin_pending_referrals");
        if (error) setFailed(true);
        else {
            setFailed(false);
            setItems((data ?? []) as PendingReferral[]);
        }
    }, []);

    useEffect(() => {
        if (enabled) load();
    }, [enabled, load]);

    async function confirmResolve() {
        if (!resolving) return;
        setSaving(true);
        setSaveError(null);
        const { error } = await supabase.rpc("admin_resolve_referral", { p_id: resolving.id, p_note: null });
        setSaving(false);
        if (error) {
            setSaveError(error.message || "Não foi possível marcar agora.");
            return;
        }
        setResolving(null);
        toast.success("Indicação marcada como resolvida");
        load();
    }

    if (failed) {
        return (
            <div className="flex flex-col items-center gap-3 py-10">
                <p className="text-sm text-gray-500">Não foi possível carregar as indicações.</p>
                <button onClick={load} className="text-sm font-semibold text-[#0F766E] hover:underline">
                    Tentar de novo
                </button>
            </div>
        );
    }

    if (!items) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#0F766E]" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2 rounded-xl bg-[#E6FFFA] px-4 py-3 text-sm text-[#0F766E]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                    Prêmios que não saíram sozinhos (ex.: anual parcelado da Google Play). Dê o prêmio na mão — no Play
                    Console, reembolso parcial de uma parcela, sem cancelar a assinatura — e depois marque como resolvido.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
                    <CheckCircle2 className="w-6 h-6 text-[#0F766E]" />
                    <p className="text-sm">Nenhum prêmio pendente.</p>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {items.map((r) => (
                        <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-1">
                            <p className="font-semibold text-gray-800">{r.referrer_church}</p>
                            {r.referrer_email && <p className="text-sm text-gray-500 break-all">{r.referrer_email}</p>}
                            <p className="text-sm text-gray-600">{planLine(r)}</p>
                            <p className="text-sm text-gray-600">Indicou: {r.referred_church}</p>
                            <p className="text-xs text-gray-400 break-all select-all">
                                Id da igreja (RevenueCat): {r.referrer_church_id}
                            </p>
                            {r.reward_note && (
                                <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-2 py-1">{r.reward_note}</p>
                            )}
                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        setSaveError(null);
                                        setResolving(r);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-[#38B2AC] text-white text-sm font-semibold hover:bg-[#319795]"
                                >
                                    Marcar como resolvido
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {resolving && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <h2 className="flex-1 text-lg font-semibold text-gray-800">Prêmio já foi dado?</h2>
                            <button
                                onClick={() => setResolving(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                                aria-label="Fechar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">
                            Confirme que {resolving.referrer_church} já recebeu o mês grátis. A igreja passa a ver
                            &quot;Prêmio recebido&quot;.
                        </p>
                        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setResolving(null)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmResolve}
                                disabled={saving}
                                className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Marcar como resolvido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
