"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Gift, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/components/shared/loading";
import { supabase } from "@/lib/supabaseClient";
import { cleanReferralCode, referralLink, referralMessage } from "@/lib/referral";

type Item = {
    church: string;
    status: "cadastrada" | "paga" | "processando" | "premiada" | "pendente_manual" | "cancelada";
    created_at: string;
    reward_due_at: string | null;
    rewarded_at: string | null;
    reward_kind: string | null;
};

type Referral = {
    code: string;
    invited: number;
    rewarded: number;
    items: Item[];
    can_apply: boolean;
    referred_by: string | null;
};

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "");

function statusText(i: Item) {
    switch (i.status) {
        case "cadastrada":
            return { text: "Criou a conta · ainda não assinou", tone: "text-gray-600 bg-gray-100" };
        case "paga":
        case "processando":
            return { text: `Assinou · seu prêmio sai em ${date(i.reward_due_at)}`, tone: "text-amber-800 bg-amber-50" };
        case "premiada":
            return { text: `Prêmio recebido em ${date(i.rewarded_at)}`, tone: "text-teal-800 bg-teal-50" };
        case "pendente_manual":
            return { text: "Prêmio em análise pela nossa equipe", tone: "text-amber-800 bg-amber-50" };
        case "cancelada":
            return { text: "Cancelou a assinatura · sem prêmio", tone: "text-gray-500 bg-gray-100" };
    }
}

export default function IndiquePage() {
    const [data, setData] = useState<Referral | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [code, setCode] = useState("");
    const [applying, setApplying] = useState(false);

    // Muda para recarregar (depois de usar um código)
    const [version, setVersion] = useState(0);
    const load = useCallback(() => setVersion((v) => v + 1), []);

    useEffect(() => {
        let alive = true;
        supabase.rpc("my_referral").then(({ data, error }) => {
            if (!alive) return;
            if (error) setError(error.message?.includes("Pastor") ? "Somente o Pastor da igreja vê as indicações." : "Não foi possível carregar suas indicações.");
            else setData(data as Referral);
        });
        return () => {
            alive = false;
        };
    }, [version]);

    if (error) return <p className="p-6 text-gray-600">{error}</p>;
    if (!data) return <Loading />;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = referralLink(origin, data.code);
    const message = referralMessage(origin, data.code);

    async function copy() {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Não foi possível copiar. Selecione o link e copie.");
        }
    }

    async function apply(e: React.FormEvent) {
        e.preventDefault();
        if (!cleanReferralCode(code)) return;
        setApplying(true);
        const { data: r, error } = await supabase.rpc("apply_referral_code", { p_code: cleanReferralCode(code) });
        setApplying(false);
        if (error || !r?.ok) {
            toast.error(r?.error ?? "Não foi possível usar este código.");
            return;
        }
        toast.success(`Pronto! Sua igreja foi indicada por ${r.referrer}.`);
        setCode("");
        load();
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6 pb-10">
            <section className="rounded-2xl bg-[#13324F] p-6 text-white sm:p-8">
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
                        <Gift className="h-6 w-6 text-[#F4B942]" aria-hidden="true" />
                    </span>
                    <h1 className="text-2xl font-semibold">Indique e ganhe</h1>
                </div>
                <p className="mt-4 max-w-xl leading-relaxed text-white/85">
                    Indique o Ministério360 para outra igreja. Quando ela assinar um plano pago, sua igreja ganha{" "}
                    <strong className="text-white">1 mês grátis</strong>. Se vocês estiverem no plano Grátis, ganham 30 dias de Premium.
                </p>

                <p className="mt-6 text-sm text-white/70">Código da sua igreja</p>
                <p className="mt-1 text-4xl font-semibold tracking-[0.2em]">{data.code}</p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 font-semibold text-white hover:bg-[#1EBE5B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        <MessageCircle className="h-5 w-5" aria-hidden="true" />
                        Enviar pelo WhatsApp
                    </a>
                    <button
                        type="button"
                        onClick={copy}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 font-semibold text-white ring-1 ring-white/35 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
                        {copied ? "Link copiado" : "Copiar link"}
                    </button>
                </div>
                <p className="mt-3 break-all text-sm text-white/60">{link}</p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-gray-800">Como funciona</h2>
                <ol className="mt-4 space-y-3 text-gray-600">
                    <li><strong className="text-gray-800">1.</strong> Envie o link ou o código para o pastor de outra igreja.</li>
                    <li><strong className="text-gray-800">2.</strong> A igreja dele cria a conta com o seu código e assina um plano pago.</li>
                    <li><strong className="text-gray-800">3.</strong> 7 dias depois do primeiro pagamento dela, sua igreja recebe o mês grátis.</li>
                </ol>
                <p className="mt-4 text-sm text-gray-500">
                    Assina pelo site: a próxima mensalidade sai de graça (no anual, desconto de 1 mês). Assina pela Google Play: a
                    renovação é adiada em 30 dias. Vale para cada igreja indicada que assinar.
                </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-semibold text-gray-800">Suas indicações</h2>
                    <p className="text-sm text-gray-500">
                        {data.invited} {data.invited === 1 ? "igreja" : "igrejas"} · {data.rewarded} {data.rewarded === 1 ? "mês ganho" : "meses ganhos"}
                    </p>
                </div>
                {data.items.length === 0 ? (
                    <p className="mt-4 text-gray-600">Nenhuma igreja usou seu código ainda. Envie o link para o primeiro pastor.</p>
                ) : (
                    <ul className="mt-4 divide-y divide-gray-100">
                        {data.items.map((i) => {
                            const s = statusText(i);
                            return (
                                <li key={`${i.church}-${i.created_at}`} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800">{i.church}</p>
                                        <p className="text-sm text-gray-500">Criou a conta em {date(i.created_at)}</p>
                                    </div>
                                    <span className={`self-start rounded-full px-3 py-1 text-sm font-medium sm:self-auto ${s.tone}`}>{s.text}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {data.referred_by && (
                <p className="text-sm text-gray-500">Sua igreja foi indicada por {data.referred_by}.</p>
            )}

            {data.can_apply && (
                <form onSubmit={apply} className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
                    <label htmlFor="codigo" className="font-semibold text-gray-800">
                        Outra igreja indicou o Ministério360 para vocês?
                    </label>
                    <p className="mt-1 text-sm text-gray-500">Informe o código dela. Dá para fazer isso nos 7 primeiros dias da conta.</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input
                            id="codigo"
                            value={code}
                            onChange={(e) => setCode(cleanReferralCode(e.target.value))}
                            placeholder="Ex.: K7M2QX"
                            maxLength={12}
                            autoComplete="off"
                            className="h-11 flex-1 rounded-xl border px-4 uppercase tracking-widest focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            type="submit"
                            disabled={applying || !code}
                            className="h-11 rounded-xl bg-teal-600 px-5 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            {applying ? "Enviando..." : "Usar código"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
