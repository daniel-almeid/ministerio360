"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Gift, HelpCircle, Loader2, Mail, MessageCircle, X } from "lucide-react";
import {
    REASONS,
    SUPPORT_EMAIL,
    lostFeatures,
    offerPrices,
    offerText,
    reasonAnswer,
    type CancelReason,
} from "@/lib/retention";
import type { BillingCycle, PlanSlug } from "@/lib/plans";
import {
    acceptDiscount,
    cancelRenewal,
    getOfferStatus,
    saveFeedback,
    type OfferStatus,
} from "../../services/retentionService";

type Props = {
    open: boolean;
    onClose: () => void;
    onCanceled: () => void;
    planName: string;
    planSlug: PlanSlug;
    billingCycle: BillingCycle;
    formattedExpiresOn: string | null;
};

type Step = "reason" | "answer" | "confirm" | "offer" | "done" | "discount_done";

// Cancelamento em etapas (igual ao app): motivo → resposta → o que a igreja perde → desconto.
// "Continuar cancelamento" aparece em todas as etapas: ninguém fica preso.
// A renovação é cancelada, mas o plano continua até o fim do período pago.
export default function CancelSubscriptionModal({
    open,
    onClose,
    onCanceled,
    planName,
    planSlug,
    billingCycle,
    formattedExpiresOn,
}: Props) {
    const [step, setStep] = useState<Step>("reason");
    const [reason, setReason] = useState<CancelReason | null>(null);
    const [details, setDetails] = useState("");
    const [offer, setOffer] = useState<OfferStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const offerRequest = useRef<Promise<OfferStatus | null> | null>(null);

    // Ao abrir, já pergunta ao servidor se a igreja pode receber o desconto
    useEffect(() => {
        if (!open) return;
        setStep("reason");
        setReason(null);
        setDetails("");
        setOffer(null);
        setError("");
        const req = getOfferStatus();
        offerRequest.current = req;
        req.then((s) => {
            if (offerRequest.current === req) setOffer(s);
        });
    }, [open]);

    if (!open) return null;

    const ate = formattedExpiresOn ?? "o fim do período já pago";
    const chosen: CancelReason = reason ?? "nao_informado";
    const answer = reasonAnswer(chosen);
    const lost = lostFeatures(planSlug);
    const hasOffer = !!offer?.eligible;
    const finished = step === "done" || step === "discount_done";

    function feedback(outcome: "canceled" | "kept") {
        saveFeedback({ reason: chosen, details, outcome, planSlug, billingCycle });
    }

    function close() {
        if (loading) return;
        if (finished) onCanceled();
        onClose();
    }

    function keep() {
        if (loading) return;
        if (reason) feedback("kept");
        onClose();
    }

    function go(next: Step) {
        setError("");
        setStep(next);
    }

    // "Tem certeza?" → oferta (se a igreja puder receber) ou cancela direto
    async function afterConfirm() {
        setLoading(true);
        const status = offer ?? (await offerRequest.current?.catch(() => null)) ?? null;
        setLoading(false);
        if (status?.eligible) {
            setOffer(status);
            go("offer");
        } else {
            await cancel();
        }
    }

    async function cancel() {
        setLoading(true);
        setError("");
        try {
            await cancelRenewal();
            feedback("canceled");
            setStep("done");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível cancelar agora.");
        } finally {
            setLoading(false);
        }
    }

    async function accept() {
        setLoading(true);
        setError("");
        try {
            await acceptDiscount(chosen, details || null);
            setStep("discount_done");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Não foi possível aplicar o desconto agora.");
        } finally {
            setLoading(false);
        }
    }

    const primary =
        "w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 inline-flex items-center justify-center gap-2";
    const secondary =
        "w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-60 inline-flex items-center justify-center gap-2";

    const keepButton = (
        <button type="button" onClick={keep} disabled={loading} className={primary}>
            Manter assinatura
        </button>
    );

    const continueButton = (onClick: () => void, label = "Continuar cancelamento") => (
        <button type="button" onClick={onClick} disabled={loading} className={secondary}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {label}
        </button>
    );

    const errorBox = error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
    );

    function header(Icon: typeof AlertTriangle, tone: "teal" | "amber" | "green", title: string) {
        const tones = {
            teal: "bg-teal-50 text-teal-600",
            amber: "bg-amber-50 text-amber-600",
            green: "bg-emerald-50 text-emerald-600",
        };
        return (
            <div className="flex items-center gap-3 pr-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tones[tone]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
        );
    }

    function body() {
        switch (step) {
            case "reason":
                return (
                    <>
                        {header(HelpCircle, "teal", "Por que você quer cancelar?")}
                        <p className="text-sm text-gray-600">Sua resposta nos ajuda a melhorar o Ministério360.</p>
                        <div role="radiogroup" className="space-y-2">
                            {REASONS.map((r) => {
                                const on = reason === r.value;
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={on}
                                        onClick={() => setReason(r.value)}
                                        className={`w-full flex items-center gap-3 text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                                            on ? "border-teal-600 bg-teal-50 text-teal-800 font-medium" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span
                                            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                                on ? "border-teal-600" : "border-gray-300"
                                            }`}
                                        >
                                            {on && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                                        </span>
                                        {r.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="space-y-2 pt-1">
                            {keepButton}
                            {continueButton(() => go("answer"), reason ? "Continuar cancelamento" : "Pular e continuar")}
                        </div>
                    </>
                );

            case "answer":
                return (
                    <>
                        {header(MessageCircle, "teal", answer.title)}
                        <p className="text-sm text-gray-600 leading-relaxed">{answer.text}</p>
                        {answer.showSupport && (
                            <a
                                href={`mailto:${SUPPORT_EMAIL}`}
                                className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2.5 text-sm font-medium text-teal-700 break-all hover:bg-teal-100"
                            >
                                <Mail className="w-4 h-4 shrink-0" />
                                {SUPPORT_EMAIL}
                            </a>
                        )}
                        {answer.askDetails && (
                            <label className="block space-y-1.5">
                                <span className="text-sm font-medium text-gray-700">{answer.askDetails} (opcional)</span>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Escreva aqui"
                                    maxLength={500}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </label>
                        )}
                        <div className="space-y-2 pt-1">
                            {keepButton}
                            {chosen === "caro" && hasOffer
                                ? continueButton(() => go("offer"), "Ver condição especial")
                                : continueButton(() => go("confirm"))}
                        </div>
                    </>
                );

            case "confirm":
                return (
                    <>
                        {header(AlertTriangle, "amber", "Tem certeza?")}
                        <p className="text-sm text-gray-600 leading-relaxed">
                            A cobrança automática do plano <strong>{planName}</strong> será cancelada. Até{" "}
                            <strong>{ate}</strong> nada muda. Depois disso, a igreja volta para o plano Grátis e deixa de
                            ter:
                        </p>
                        <ul className="space-y-1.5 rounded-xl bg-red-50 p-3">
                            {lost.map((f) => (
                                <li key={f} className="flex gap-2 text-sm text-red-900">
                                    <X className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Nenhum dado é apagado. Valores já pagos não são devolvidos, exceto no arrependimento em até 7
                            dias da contratação (peça pelo e-mail de suporte, conforme os Termos de Uso).
                        </p>
                        {errorBox}
                        <div className="space-y-2 pt-1">
                            {keepButton}
                            {hasOffer || offer === null
                                ? continueButton(afterConfirm)
                                : continueButton(cancel, "Cancelar renovação")}
                        </div>
                    </>
                );

            case "offer": {
                const o = offer!;
                const prices = offerPrices(planSlug, o);
                return (
                    <>
                        {header(Gift, "teal", "Espere! Temos uma oferta para você")}
                        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-center space-y-1">
                            <p className="text-3xl font-extrabold text-teal-700">{o.percent}% OFF</p>
                            <p className="font-semibold text-teal-900">{offerText(o)}</p>
                            <p className="text-sm text-gray-600 pt-1">
                                <span className="line-through text-gray-400">{prices.from}</span> por{" "}
                                <strong className="text-gray-800">{prices.to}</strong>
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            O desconto entra nas próximas cobranças automáticas. Depois, o valor volta ao normal. Oferta
                            válida uma vez a cada 12 meses.
                        </p>
                        {errorBox}
                        <div className="space-y-2 pt-1">
                            <button type="button" onClick={accept} disabled={loading} className={primary}>
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Quero o desconto
                            </button>
                            <button
                                type="button"
                                onClick={cancel}
                                disabled={loading}
                                className="w-full py-2 text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
                            >
                                Não, quero cancelar a renovação
                            </button>
                        </div>
                    </>
                );
            }

            case "discount_done":
                return (
                    <>
                        {header(CheckCircle2, "green", "Desconto aplicado!")}
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Que bom que você vai continuar. A igreja ganhou{" "}
                            <strong>{offer ? offerText(offer) : "o desconto"}</strong>, e o plano{" "}
                            <strong>{planName}</strong> segue funcionando normalmente.
                        </p>
                        <button type="button" onClick={close} className={primary}>
                            Continuar usando
                        </button>
                    </>
                );

            case "done":
                return (
                    <>
                        {header(CheckCircle2, "green", "Renovação cancelada")}
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Pronto. Você não será mais cobrado e continua com o plano <strong>{planName}</strong> até{" "}
                            <strong>{ate}</strong>. Se mudar de ideia, é só assinar de novo.
                        </p>
                        <button type="button" onClick={close} className={primary}>
                            Entendi
                        </button>
                    </>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div
                role="dialog"
                aria-modal="true"
                className="relative bg-white rounded-2xl p-6 w-full max-w-md max-h-[92vh] overflow-y-auto space-y-4 shadow-xl"
            >
                <button
                    type="button"
                    onClick={finished ? close : keep}
                    disabled={loading}
                    aria-label="Fechar"
                    className="absolute right-3 top-3 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
                {body()}
            </div>
        </div>
    );
}
