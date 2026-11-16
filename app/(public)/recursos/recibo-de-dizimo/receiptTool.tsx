"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { track } from "@/lib/analytics";
import { reaisPorExtenso } from "@/app/(protected)/financas/receipts/extenso";

const TYPES = ["Dízimo", "Oferta", "Oferta de missões", "Doação"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "1.234,56" -> 1234.56
function parseMoney(text: string) {
    const clean = text.replace(/[^\d,]/g, "").replace(",", ".");
    const n = Number(clean);
    return Number.isFinite(n) ? n : 0;
}

// digitação: "123456" -> "1.234,56"
function maskMoney(text: string) {
    const digits = text.replace(/\D/g, "").replace(/^0+/, "").slice(0, 11);
    if (!digits) return "";
    const cents = digits.padStart(3, "0");
    const int = cents.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${int},${cents.slice(-2)}`;
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function longDate(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return "";
    return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

const field =
    "mt-1 w-full rounded-xl border border-[#D6E4E1] bg-white px-3.5 py-2.5 text-[15px] text-[#1B2430] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15";

// Recibo de dízimo/oferta: preenche na tela e imprime ou salva em PDF pelo navegador.
// Nada é enviado para o servidor.
export default function ReceiptTool() {
    const [church, setChurch] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [city, setCity] = useState("");
    const [type, setType] = useState(TYPES[0]);
    const [person, setPerson] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(today());
    const [signer, setSigner] = useState("Tesouraria");

    const value = parseMoney(amount);
    const extenso = useMemo(() => (value > 0 ? reaisPorExtenso(value) : ""), [value]);
    const blank = (text: string, width = "12rem") =>
        text.trim() ? <strong>{text.trim()}</strong> : <span className="inline-block border-b border-[#9CA3AF] align-bottom" style={{ width }} />;

    return (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <form className="rounded-3xl bg-white p-6 ring-1 ring-[#DCEBE8] print:hidden" onSubmit={(e) => e.preventDefault()}>
                <p className="font-semibold text-[#13324F]">Preencha o recibo</p>
                <div className="mt-4 grid gap-4">
                    <label className="text-sm font-medium text-[#33414F]">
                        Nome da igreja
                        <input className={field} value={church} onChange={(e) => setChurch(e.target.value)} placeholder="Ex.: Igreja Batista Esperança" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-medium text-[#33414F]">
                            CNPJ (opcional)
                            <input className={field} value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" inputMode="numeric" />
                        </label>
                        <label className="text-sm font-medium text-[#33414F]">
                            Cidade (opcional)
                            <input className={field} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Nova Iguaçu - RJ" />
                        </label>
                    </div>
                    <label className="text-sm font-medium text-[#33414F]">
                        Tipo
                        <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
                            {TYPES.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-[#33414F]">
                        Nome de quem contribuiu
                        <input className={field} value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Nome completo" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-medium text-[#33414F]">
                            Valor (R$)
                            <input className={field} value={amount} onChange={(e) => setAmount(maskMoney(e.target.value))} placeholder="0,00" inputMode="numeric" />
                        </label>
                        <label className="text-sm font-medium text-[#33414F]">
                            Data
                            <input className={field} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </label>
                    </div>
                    <label className="text-sm font-medium text-[#33414F]">
                        Quem assina
                        <input className={field} value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="Tesouraria" />
                    </label>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        track("recurso_recibo_impresso", { tipo: type });
                        window.print();
                    }}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0F766E] px-6 font-semibold text-white hover:bg-[#0D5C56]"
                >
                    <Printer className="h-5 w-5" aria-hidden="true" />
                    Imprimir ou salvar em PDF
                </button>
                <p className="mt-3 text-center text-xs text-[#5B6B7B]">
                    No celular, escolha “Salvar como PDF” na tela de impressão. Os dados ficam só no seu aparelho.
                </p>
            </form>

            {/* O recibo (é a única parte que sai na impressão) */}
            <div className="rounded-3xl bg-white p-2 ring-1 ring-[#DCEBE8] print:p-0 print:ring-0">
                <article id="recibo" className="rounded-2xl border-2 border-[#13324F] p-6 text-[15px] leading-relaxed text-[#1B2430] sm:p-8 print:border">
                    <div className="flex items-start justify-between gap-4 border-b border-[#D6E4E1] pb-4">
                        <div className="min-w-0">
                            <p className="text-lg font-semibold text-[#13324F]">{church.trim() || "Nome da igreja"}</p>
                            {cnpj.trim() && <p className="text-sm text-[#5B6B7B]">CNPJ {cnpj.trim()}</p>}
                        </div>
                        <div className="shrink-0 rounded-xl bg-[#E3F2EF] px-3 py-2 text-right">
                            <p className="text-xs text-[#5B6B7B]">Valor</p>
                            <p className="text-lg font-semibold text-[#0F766E]">{brl(value)}</p>
                        </div>
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-[#13324F]">Recibo de {type.toLowerCase()}</h2>
                    <p className="mt-3">
                        Recebemos de {blank(person, "14rem")} a importância de <strong>{brl(value)}</strong>
                        {extenso ? ` (${extenso})` : ""}, referente a <strong>{type.toLowerCase()}</strong>.
                    </p>
                    <p className="mt-3">Para clareza, firmamos o presente recibo.</p>
                    <p className="mt-6 text-right">
                        {city.trim() ? `${city.trim()}, ` : ""}
                        {longDate(date)}.
                    </p>
                    <div className="mx-auto mt-14 w-64 border-t border-[#1B2430] pt-2 text-center text-sm">
                        {church.trim() || "Igreja"}
                        <br />
                        {signer.trim() || "Tesouraria"}
                    </div>
                </article>
            </div>
        </div>
    );
}
