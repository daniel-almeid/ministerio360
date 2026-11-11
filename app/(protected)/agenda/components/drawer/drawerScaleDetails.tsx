"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock, Copy, MessageCircle, Send, X, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Loading from "@/components/shared/loading";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useHeaderData } from "@/components/shared/header/useHeaderData";
import { useMyAccess } from "@/components/shared/access/useMyAccess";
import { copyText, openInNewTab, whatsappChatUrl, whatsappShareUrl } from "@/lib/whatsapp";
import { fetchScaleShareData, formatRespondedAt, setScaleResponse } from "../../whatsapp/scaleShareService";
import { groupMessage, personMessage, reminderMessage } from "../../whatsapp/scaleMessages";
import type { ScalePerson, ScaleResponseStatus, ScaleShareData } from "../../whatsapp/types";

const STATUS: Record<ScaleResponseStatus, { label: string; className: string; icon: typeof Clock }> = {
    confirmed: { label: "Confirmou", className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
    declined: { label: "Não pode", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
    pending: { label: "Aguardando", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
};

type Mode = "send" | "remind";

export default function DrawerScaleDetails({
    scaleId,
    ministryIds = [],
    onClose,
}: {
    scaleId: string;
    ministryIds?: string[];
    onClose: () => void;
}) {
    const { churchName } = useHeaderData();
    const { canEditScale } = useMyAccess();
    const canMark = canEditScale(ministryIds);

    const [data, setData] = useState<ScaleShareData | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [mode, setMode] = useState<Mode>("send");
    // Quem já recebeu a mensagem nesta janela (só para marcar na tela)
    const [sent, setSent] = useState<Set<string>>(new Set());

    async function load(quiet = false) {
        if (!quiet) setLoading(true);
        try {
            setData(await fetchScaleShareData(scaleId));
            setFailed(false);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (scaleId) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scaleId]);

    const people = data?.people ?? [];
    const counts = useMemo(() => {
        const c = { confirmed: 0, declined: 0, pending: 0 };
        people.forEach((p) => (c[p.status] += 1));
        return c;
    }, [people]);
    const statusOf = useMemo(() => new Map(people.map((p) => [p.name, p])), [people]);

    const targets = mode === "remind" ? people.filter((p) => p.status === "pending") : people;

    function message(p: ScalePerson) {
        return mode === "remind" ? reminderMessage(data!, p, churchName) : personMessage(data!, p, churchName);
    }

    async function sendTo(p: ScalePerson) {
        const text = message(p);
        if (p.whatsapp) {
            openInNewTab(whatsappChatUrl(p.whatsapp, text));
        } else if (await copyText(text)) {
            toast.success(`${p.name.split(" ")[0]} está sem telefone. A mensagem foi copiada.`);
        } else {
            toast.error("Sem telefone no cadastro.");
        }
        setSent((s) => new Set(s).add(p.memberId));
    }

    async function shareGroup(copyOnly = false) {
        const text = groupMessage(data!, churchName);
        if (copyOnly) {
            if (await copyText(text)) toast.success("Escala copiada.");
            else toast.error("Não foi possível copiar.");
            return;
        }
        openInNewTab(whatsappShareUrl(text));
    }

    async function mark(p: ScalePerson, status: ScaleResponseStatus) {
        if (p.status === status) return;
        try {
            await setScaleResponse(scaleId, p.memberId, status);
            toast.success(`${p.name.split(" ")[0]}: ${STATUS[status].label.toLowerCase()}`);
            await load(true);
        } catch {
            toast.error("Não foi possível salvar. Tente de novo.");
        }
    }

    const sentCount = targets.filter((p) => sent.has(p.memberId)).length;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

                <motion.div
                    className="relative bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl custom-scrollbar pr-2"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Detalhes da Escala</h3>
                        <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fechar">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : failed || !data ? (
                        <p className="text-sm text-gray-500">Não foi possível carregar a escala.</p>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Data</p>
                                    <p className="font-medium text-gray-800">
                                        {format(parseISO(data.date), "dd/MM/yyyy", { locale: ptBR })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Responsável</p>
                                    <p className="font-medium text-gray-800">{data.responsible || "—"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Evento</p>
                                    <p className="font-medium text-gray-800">{data.event}</p>
                                </div>
                            </div>

                            {people.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {(["confirmed", "pending", "declined"] as ScaleResponseStatus[]).map((s) => (
                                        <div key={s} className={`rounded-lg border px-3 py-2 ${STATUS[s].className}`}>
                                            <p className="text-lg font-bold leading-tight">{counts[s]}</p>
                                            <p className="text-xs">{STATUS[s].label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <p className="text-xs text-gray-500 mb-3">Ministérios e Membros</p>

                                {!data.byMinistry.some((g) => g.members.length) ? (
                                    <p className="text-xs text-gray-400 italic">Nenhum ministério ou membro listado.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {data.byMinistry
                                            .filter((g) => g.members.length)
                                            .map((g) => (
                                                <div key={g.ministry} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="font-semibold text-[#319795] mb-2">{g.ministry}</p>
                                                    <ul className="space-y-2">
                                                        {g.members.map((name, i) => {
                                                            const p = statusOf.get(name);
                                                            return (
                                                                <li key={`${name}-${i}`} className="flex items-center gap-2 text-sm">
                                                                    <span className="flex-1 min-w-0">
                                                                        <span className="block text-gray-700 truncate">{name}</span>
                                                                        {p && p.status !== "pending" && p.respondedAt && (
                                                                            <span className="block text-[11px] text-gray-400">
                                                                                {p.source === "leader" ? "Marcado pelo líder" : "Respondeu"}{" "}
                                                                                {formatRespondedAt(p.respondedAt)}
                                                                                {p.note ? ` · “${p.note}”` : ""}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    {p &&
                                                                        (canMark ? (
                                                                            <select
                                                                                value={p.status}
                                                                                onChange={(e) =>
                                                                                    mark(p, e.target.value as ScaleResponseStatus)
                                                                                }
                                                                                aria-label={`Presença de ${name}`}
                                                                                className={`text-xs font-semibold rounded-full border px-2 py-1 cursor-pointer ${STATUS[p.status].className}`}
                                                                            >
                                                                                <option value="pending">Aguardando</option>
                                                                                <option value="confirmed">Confirmou</option>
                                                                                <option value="declined">Não pode</option>
                                                                            </select>
                                                                        ) : (
                                                                            <span
                                                                                className={`text-xs font-semibold rounded-full border px-2 py-1 ${STATUS[p.status].className}`}
                                                                            >
                                                                                {STATUS[p.status].label}
                                                                            </span>
                                                                        ))}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {people.length > 0 && (
                                <div className="rounded-xl border border-[#CFE6E2] p-4 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                        <p className="font-semibold text-gray-800">Avisar pelo WhatsApp</p>
                                    </div>

                                    <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
                                        <button
                                            onClick={() => setMode("send")}
                                            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                mode === "send" ? "bg-[#38B2AC] text-white" : "text-gray-600"
                                            }`}
                                        >
                                            Enviar escala
                                        </button>
                                        <button
                                            onClick={() => setMode("remind")}
                                            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                mode === "remind" ? "bg-[#38B2AC] text-white" : "text-gray-600"
                                            }`}
                                        >
                                            Lembrar ({counts.pending})
                                        </button>
                                    </div>

                                    {mode === "send" && (
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => shareGroup()}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5A] text-white text-sm font-semibold"
                                            >
                                                <Send className="w-4 h-4" />
                                                Escala completa no grupo
                                            </button>
                                            <button
                                                onClick={() => shareGroup(true)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copiar
                                            </button>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {mode === "remind"
                                                ? "Lembrete para quem ainda não respondeu, com o link de confirmação."
                                                : "Mensagem no privado de cada um, com o link para confirmar presença."}
                                            {targets.length > 0 && ` ${sentCount} de ${targets.length} enviados.`}
                                        </p>

                                        {targets.length === 0 ? (
                                            <p className="text-sm text-gray-500">Todos já responderam. 🙌</p>
                                        ) : (
                                            <ul className="divide-y divide-gray-100">
                                                {targets.map((p) => {
                                                    const done = sent.has(p.memberId);
                                                    return (
                                                        <li key={p.memberId} className="flex items-center gap-2 py-2">
                                                            <span className="flex-1 min-w-0">
                                                                <span className="block text-sm text-gray-800 truncate">{p.name}</span>
                                                                <span className="block text-[11px] text-gray-400 truncate">
                                                                    {p.whatsapp ? p.phone : "Sem telefone · a mensagem é copiada"}
                                                                </span>
                                                            </span>
                                                            <button
                                                                onClick={() => sendTo(p)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                                                    done
                                                                        ? "bg-gray-100 text-gray-500"
                                                                        : p.whatsapp
                                                                          ? "bg-[#25D366] hover:bg-[#1EBE5A] text-white"
                                                                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                                                                }`}
                                                            >
                                                                {done ? (
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                ) : mode === "remind" ? (
                                                                    <Bell className="w-4 h-4" />
                                                                ) : p.whatsapp ? (
                                                                    <Send className="w-4 h-4" />
                                                                ) : (
                                                                    <Copy className="w-4 h-4" />
                                                                )}
                                                                {done ? "Enviado" : mode === "remind" ? "Lembrar" : p.whatsapp ? "Enviar" : "Copiar"}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
