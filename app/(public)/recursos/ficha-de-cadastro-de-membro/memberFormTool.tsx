"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { track } from "@/lib/analytics";

const field =
    "mt-1 w-full rounded-xl border border-[#D6E4E1] bg-white px-3.5 py-2.5 text-[15px] text-[#1B2430] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15";

function Line({ label, wide = false }: { label: string; wide?: boolean }) {
    return (
        <div className={`flex items-end gap-2 ${wide ? "col-span-2" : ""}`}>
            <span className="whitespace-nowrap text-[13px] text-[#33414F]">{label}</span>
            <span className="h-5 flex-1 border-b border-[#9CA3AF]" />
        </div>
    );
}

function Box({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-[#33414F]">
            <span className="inline-block h-3.5 w-3.5 rounded-[3px] border border-[#6B7280]" />
            {label}
        </span>
    );
}

// Ficha de cadastro de membro em branco, com o nome da igreja, para imprimir
export default function MemberFormTool() {
    const [church, setChurch] = useState("");
    const [consent, setConsent] = useState(true);
    const name = church.trim() || "Nome da igreja";

    return (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="h-fit rounded-3xl bg-white p-6 ring-1 ring-[#DCEBE8] print:hidden">
                <p className="font-semibold text-[#13324F]">Personalize a ficha</p>
                <label className="mt-4 block text-sm font-medium text-[#33414F]">
                    Nome da igreja
                    <input className={field} value={church} onChange={(e) => setChurch(e.target.value)} placeholder="Ex.: Igreja Batista Esperança" />
                </label>
                <label className="mt-4 flex items-start gap-3 text-sm text-[#33414F]">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0F766E]" />
                    Incluir a autorização de uso dos dados (recomendado pela LGPD)
                </label>
                <button
                    type="button"
                    onClick={() => {
                        track("recurso_ficha_impressa", { com_nome_igreja: !!church.trim() });
                        window.print();
                    }}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0F766E] px-6 font-semibold text-white hover:bg-[#0D5C56]"
                >
                    <Printer className="h-5 w-5" aria-hidden="true" />
                    Imprimir ou salvar em PDF
                </button>
                <p className="mt-3 text-center text-xs text-[#5B6B7B]">Sai numa folha A4. Imprima quantas precisar.</p>
            </div>

            <div className="rounded-3xl bg-white p-2 ring-1 ring-[#DCEBE8] print:p-0 print:ring-0">
                <article className="rounded-2xl border border-[#D6E4E1] p-6 sm:p-8 print:border-0 print:p-0">
                    <div className="border-b-2 border-[#13324F] pb-3">
                        <p className="text-lg font-semibold text-[#13324F]">{name}</p>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5B6B7B]">Ficha de cadastro de membro</h2>
                    </div>

                    <p className="mt-5 text-[13px] font-semibold text-[#13324F]">Dados pessoais</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4">
                        <Line label="Nome completo:" wide />
                        <Line label="Data de nascimento:" />
                        <Line label="Estado civil:" />
                        <Line label="Celular / WhatsApp:" />
                        <Line label="E-mail:" />
                        <Line label="Endereço:" wide />
                        <Line label="Bairro:" />
                        <Line label="Cidade:" />
                    </div>

                    <p className="mt-6 text-[13px] font-semibold text-[#13324F]">Vida na igreja</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4">
                        <Line label="Data de conversão:" />
                        <Line label="Data de batismo:" />
                        <Line label="Igreja anterior:" wide />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <span className="text-[13px] text-[#33414F]">Gostaria de servir em:</span>
                        <Box label="Louvor" />
                        <Box label="Mídia" />
                        <Box label="Recepção" />
                        <Box label="Infantil" />
                        <Box label="Intercessão" />
                        <Box label="Outro: ________" />
                    </div>
                    <div className="mt-4">
                        <Line label="Observações:" wide />
                        <div className="mt-4 h-5 border-b border-[#9CA3AF]" />
                    </div>

                    {consent && (
                        <div className="mt-6 rounded-xl bg-[#F7FBFA] p-4 text-[12.5px] leading-relaxed text-[#33414F] print:bg-transparent print:p-0">
                            <p className="font-semibold text-[#13324F]">Autorização de uso dos dados</p>
                            <p className="mt-1">
                                Autorizo a {church.trim() || "igreja"} a guardar e usar os dados desta ficha para o cadastro de
                                membros, a comunicação da igreja comigo (inclusive pelo WhatsApp) e a organização dos
                                ministérios. Sei que posso pedir para ver, corrigir ou apagar meus dados a qualquer momento.
                            </p>
                        </div>
                    )}

                    <div className="mt-12 grid grid-cols-2 gap-8 text-center text-[12.5px] text-[#33414F]">
                        <div className="border-t border-[#1B2430] pt-2">Assinatura do membro</div>
                        <div className="border-t border-[#1B2430] pt-2">Data</div>
                    </div>
                </article>
            </div>
        </div>
    );
}
