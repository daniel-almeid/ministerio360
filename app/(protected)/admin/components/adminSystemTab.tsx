"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Power, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import {
    checkSystemStatus,
    describeTime,
    DURATION_OPTIONS,
    planWindow,
    setMaintenance,
    START_OPTIONS,
    type SystemStatus,
} from "@/lib/systemStatus";

// Administração › Sistema: liga e desliga o modo manutenção do app e do site (igual ao app)
export default function AdminSystemTab({ enabled }: { enabled: boolean }) {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [failed, setFailed] = useState(false);
    const [startIn, setStartIn] = useState<number>(0);
    const [duration, setDuration] = useState<number>(30);
    const [message, setMessage] = useState("");
    const [confirm, setConfirm] = useState<"on" | "off" | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const result = await checkSystemStatus();
        if (result.kind === "ok") {
            setStatus(result.status);
            setFailed(false);
        } else setFailed(true);
    }, []);

    useEffect(() => {
        if (enabled) load();
    }, [enabled, load]);

    if (failed) {
        return (
            <div className="flex flex-col items-center gap-3 py-10">
                <p className="text-sm text-gray-500">Não foi possível ver o estado do sistema.</p>
                <button onClick={load} className="text-sm font-semibold text-[#0F766E] hover:underline">
                    Tentar de novo
                </button>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#0F766E]" />
            </div>
        );
    }

    const isOn = status.active || status.scheduled;
    const preview = planWindow(startIn, duration);

    async function apply() {
        setSaving(true);
        setSaveError(null);
        try {
            if (confirm === "on") {
                const next = await setMaintenance({ on: true, ...planWindow(startIn, duration), message });
                setStatus(next);
                toast.success(next.active ? "Manutenção ligada" : "Manutenção programada");
            } else {
                const next = await setMaintenance({ on: false });
                setStatus(next);
                setMessage("");
                toast.success("Manutenção desligada. Todos já podem usar.");
            }
            setConfirm(null);
        } catch (e: any) {
            setSaveError(e?.message ?? "Não foi possível salvar agora.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-2xl">
            <div className={`rounded-2xl border p-5 space-y-4 ${isOn ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}>
                <div className="flex items-start gap-3">
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isOn ? "bg-amber-100 text-amber-700" : "bg-[#E6F7F5] text-[#0F766E]"
                        }`}
                    >
                        <Wrench className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="text-base font-bold text-[#1E3A5F]">Modo manutenção</h3>
                        <p className="text-sm text-gray-500">
                            {status.active
                                ? "Ligado agora: as igrejas veem a tela de manutenção no app e no site."
                                : status.scheduled
                                  ? `Programado para ${describeTime(status.startsAt)}. Até lá, as igrejas veem um aviso.`
                                  : "Desligado: todos usam o app e o site normalmente."}
                        </p>
                    </div>
                </div>

                {isOn ? (
                    <>
                        {status.endsAt && <p className="text-sm text-gray-700">Previsão de volta: {describeTime(status.endsAt)}</p>}
                        {status.message && <p className="text-sm text-gray-700">Mensagem: “{status.message}”</p>}
                        <p className="text-xs text-gray-500">Você continua usando normalmente para conferir tudo antes de liberar.</p>
                        <button
                            onClick={() => setConfirm("off")}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 font-semibold text-white hover:bg-[#0D5C56]"
                        >
                            <Power className="h-4 w-4" />
                            Desligar manutenção
                        </button>
                    </>
                ) : (
                    <>
                        <Field label="Quando começa">
                            <Chips options={START_OPTIONS} value={startIn} onChange={setStartIn} />
                        </Field>
                        <Field label="Previsão de duração">
                            <Chips options={DURATION_OPTIONS} value={duration} onChange={setDuration} />
                        </Field>
                        <Field label="Mensagem (opcional)">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={300}
                                rows={3}
                                placeholder="Estamos melhorando o Ministério360 para você. Volte em alguns minutos."
                                className="w-full rounded-xl border-[1.5px] border-gray-200 p-3 text-sm outline-none focus:border-[#38B2AC]"
                            />
                        </Field>
                        <p className="text-xs text-gray-500">
                            {startIn > 0
                                ? `As igrejas veem um aviso até ${describeTime(preview.startsAt!.toISOString())}; depois, a tela de manutenção.`
                                : "A tela de manutenção aparece para as igrejas em até 1 minuto."}
                            {preview.endsAt ? ` Previsão de volta: ${describeTime(preview.endsAt.toISOString())}.` : ""}
                        </p>
                        <button
                            onClick={() => setConfirm("on")}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 font-semibold text-white hover:bg-amber-800"
                        >
                            <Wrench className="h-4 w-4" />
                            {startIn > 0 ? "Programar manutenção" : "Ligar manutenção"}
                        </button>
                    </>
                )}
            </div>

            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {confirm === "on" ? "Ligar a manutenção?" : "Desligar a manutenção?"}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {confirm === "on"
                                ? "Todas as igrejas ficam sem acessar o app e o site até você desligar. Pagamentos e renovações continuam funcionando."
                                : "O app e o site voltam a funcionar para todas as igrejas."}
                        </p>
                        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirm(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={apply}
                                disabled={saving}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white disabled:opacity-60 ${
                                    confirm === "on" ? "bg-amber-700 hover:bg-amber-800" : "bg-[#0F766E] hover:bg-[#0D5C56]"
                                }`}
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {confirm === "on" ? (startIn > 0 ? "Programar" : "Ligar agora") : "Desligar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="mb-2 text-[13px] font-semibold text-gray-700">{label}</p>
            {children}
        </div>
    );
}

function Chips({
    options,
    value,
    onChange,
}: {
    options: readonly { value: number; label: string }[];
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div role="radiogroup" className="flex flex-wrap gap-2">
            {options.map((o) => {
                const on = o.value === value;
                return (
                    <button
                        key={o.label}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => onChange(o.value)}
                        className={`rounded-full border-[1.5px] px-4 py-2 text-sm transition ${
                            on ? "border-[#0F766E] bg-[#E6F7F5] font-bold text-[#0F766E]" : "border-gray-200 text-gray-700 hover:border-[#9EDBD5]"
                        }`}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
