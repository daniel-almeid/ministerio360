"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, Church, Loader2, LinkIcon, User, Users, X } from "lucide-react";
import { supabase } from "../../../../lib/supabaseClient";

type Invite = {
    found: true;
    first_name: string;
    church: string | null;
    event: string | null;
    date: string; // AAAA-MM-DD
    responsible: string | null;
    ministries: string[];
    status: "pending" | "confirmed" | "declined";
    note: string | null;
    responded_at: string | null;
    can_respond: boolean;
};

type State =
    | { kind: "loading" }
    | { kind: "invalid" }
    | { kind: "error" }
    | { kind: "ready"; invite: Invite };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// "2026-10-25" -> "domingo, 25 de outubro"
function formatDate(value: string) {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return value;
    const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
    return `${weekday}, ${d} de ${MONTHS[m - 1]}`;
}

function joinNames(names: string[]) {
    if (names.length <= 1) return names[0] ?? "";
    return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function ConfirmPresence({ token }: { token: string }) {
    const [state, setState] = useState<State>({ kind: "loading" });
    const [declining, setDeclining] = useState(false);
    const [editing, setEditing] = useState(false);
    const [note, setNote] = useState("");
    const [sending, setSending] = useState<"confirmed" | "declined" | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);

    useEffect(() => {
        if (!UUID.test(token)) {
            setState({ kind: "invalid" });
            return;
        }

        supabase
            .rpc("get_scale_invite", { p_token: token })
            .then(({ data, error }) => {
                if (error) return setState({ kind: "error" });
                if (!data?.found) return setState({ kind: "invalid" });
                setState({ kind: "ready", invite: data as Invite });
            });
    }, [token]);

    async function respond(status: "confirmed" | "declined") {
        setSending(status);
        setSendError(null);

        const { data, error } = await supabase.rpc("respond_scale_invite", {
            p_token: token,
            p_status: status,
            p_note: status === "declined" ? note : null,
        });

        setSending(null);

        if (error) {
            setSendError(
                error.message?.includes("prazo")
                    ? "O prazo para responder esta escala terminou."
                    : "Não foi possível enviar sua resposta. Verifique a internet e tente de novo."
            );
            return;
        }
        if (!data?.found) return setState({ kind: "invalid" });

        setState({ kind: "ready", invite: data as Invite });
        setDeclining(false);
        setEditing(false);
    }

    return (
        <main className="min-h-dvh bg-gray-50 flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo360-cor.png" alt="Ministério360" className="h-9 w-auto" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {state.kind === "loading" && (
                        <div className="flex flex-col items-center gap-3 py-10 text-gray-500">
                            <Loader2 className="w-7 h-7 animate-spin text-[#38B2AC]" />
                            <p className="text-sm">Carregando sua escala...</p>
                        </div>
                    )}

                    {state.kind === "invalid" && (
                        <Message
                            icon={<LinkIcon className="w-6 h-6 text-gray-400" />}
                            title="Link inválido"
                            text="Este link não existe ou a escala foi alterada. Peça um novo link ao responsável."
                        />
                    )}

                    {state.kind === "error" && (
                        <Message
                            icon={<X className="w-6 h-6 text-red-500" />}
                            title="Algo deu errado"
                            text="Não foi possível carregar a escala. Verifique sua internet e abra o link de novo."
                        />
                    )}

                    {state.kind === "ready" && (
                        <InviteView
                            invite={state.invite}
                            declining={declining}
                            editing={editing}
                            note={note}
                            sending={sending}
                            sendError={sendError}
                            onNote={setNote}
                            onConfirm={() => respond("confirmed")}
                            onDeclineStart={() => {
                                setDeclining(true);
                                setSendError(null);
                            }}
                            onDeclineCancel={() => setDeclining(false)}
                            onDeclineSend={() => respond("declined")}
                            onEdit={() => {
                                setEditing(true);
                                setDeclining(false);
                                setNote(state.invite.note ?? "");
                            }}
                            onEditCancel={() => setEditing(false)}
                        />
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    {state.kind === "ready" && state.invite.church ? `${state.invite.church} · ` : ""}Ministério360
                </p>
            </div>
        </main>
    );
}

function Message({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <div className="flex flex-col items-center text-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">{icon}</div>
            <h1 className="text-lg font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
        </div>
    );
}

function InviteView({
    invite,
    declining,
    editing,
    note,
    sending,
    sendError,
    onNote,
    onConfirm,
    onDeclineStart,
    onDeclineCancel,
    onDeclineSend,
    onEdit,
    onEditCancel,
}: {
    invite: Invite;
    declining: boolean;
    editing: boolean;
    note: string;
    sending: "confirmed" | "declined" | null;
    sendError: string | null;
    onNote: (v: string) => void;
    onConfirm: () => void;
    onDeclineStart: () => void;
    onDeclineCancel: () => void;
    onDeclineSend: () => void;
    onEdit: () => void;
    onEditCancel: () => void;
}) {
    const answered = invite.status !== "pending";
    const showButtons = invite.can_respond && (!answered || editing);

    return (
        <div>
            <p className="text-sm text-gray-500">Olá{invite.first_name ? `, ${invite.first_name}` : ""}! 👋</p>
            <h1 className="text-xl font-bold text-gray-800 mt-1">Você está na escala</h1>

            <div className="mt-5 space-y-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
                <Detail icon={<CalendarDays className="w-4 h-4" />} label={formatDate(invite.date)} strong />
                {invite.event && <Detail icon={<Church className="w-4 h-4" />} label={invite.event} />}
                {invite.ministries.length > 0 && (
                    <Detail icon={<Users className="w-4 h-4" />} label={`Ministério: ${joinNames(invite.ministries)}`} />
                )}
                {invite.responsible && (
                    <Detail icon={<User className="w-4 h-4" />} label={`Responsável: ${invite.responsible}`} />
                )}
            </div>

            {/* Resposta atual */}
            {answered && !editing && (
                <div
                    className={`mt-5 rounded-xl p-4 flex gap-3 items-start ${
                        invite.status === "confirmed" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                >
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            invite.status === "confirmed" ? "bg-green-600" : "bg-red-600"
                        }`}
                    >
                        {invite.status === "confirmed" ? (
                            <Check className="w-5 h-5 text-white" />
                        ) : (
                            <X className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold">
                            {invite.status === "confirmed" ? "Presença confirmada!" : "Você avisou que não pode."}
                        </p>
                        <p className="text-sm opacity-80 mt-0.5">
                            {invite.status === "confirmed"
                                ? "Obrigado! O responsável já foi avisado. 🙏"
                                : "Obrigado por avisar. O responsável já está sabendo."}
                        </p>
                        {invite.status === "declined" && invite.note && (
                            <p className="text-sm mt-2 italic break-words">“{invite.note}”</p>
                        )}
                    </div>
                </div>
            )}

            {answered && !editing && invite.can_respond && (
                <button onClick={onEdit} className="mt-3 w-full text-sm font-semibold text-[#0F766E] py-2 hover:underline">
                    Mudar minha resposta
                </button>
            )}

            {!invite.can_respond && (
                <p className="mt-5 text-sm text-gray-500 text-center">
                    {answered
                        ? "O prazo para mudar a resposta terminou."
                        : "O prazo para responder esta escala terminou. Fale com o responsável."}
                </p>
            )}

            {/* Botões */}
            {showButtons && !declining && (
                <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-gray-700 text-center">Você poderá servir neste dia?</p>
                    <button
                        onClick={onConfirm}
                        disabled={!!sending}
                        className="w-full h-12 rounded-xl bg-[#38B2AC] hover:bg-[#319795] disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2"
                    >
                        {sending === "confirmed" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Confirmo, estarei lá
                    </button>
                    <button
                        onClick={onDeclineStart}
                        disabled={!!sending}
                        className="w-full h-12 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-semibold flex items-center justify-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        Não posso
                    </button>
                    {editing && (
                        <button onClick={onEditCancel} disabled={!!sending} className="w-full text-sm text-gray-500 py-2">
                            Manter minha resposta
                        </button>
                    )}
                </div>
            )}

            {showButtons && declining && (
                <div className="mt-6 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Quer deixar um motivo? <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => onNote(e.target.value.slice(0, 300))}
                        rows={3}
                        placeholder="Ex.: estarei viajando"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#38B2AC] resize-none"
                    />
                    <button
                        onClick={onDeclineSend}
                        disabled={!!sending}
                        className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2"
                    >
                        {sending === "declined" && <Loader2 className="w-5 h-5 animate-spin" />}
                        Avisar que não posso
                    </button>
                    <button onClick={onDeclineCancel} disabled={!!sending} className="w-full text-sm text-gray-500 py-2">
                        Voltar
                    </button>
                </div>
            )}

            {sendError && <p className="mt-4 text-sm text-red-600 text-center">{sendError}</p>}
        </div>
    );
}

function Detail({ icon, label, strong }: { icon: React.ReactNode; label: string; strong?: boolean }) {
    return (
        <div className="flex items-center gap-3 text-gray-700">
            <span className="w-7 h-7 rounded-lg bg-[#E6FFFA] text-[#0F766E] flex items-center justify-center shrink-0">
                {icon}
            </span>
            <span className={`text-sm ${strong ? "font-semibold text-gray-800 first-letter:uppercase" : ""}`}>{label}</span>
        </div>
    );
}
