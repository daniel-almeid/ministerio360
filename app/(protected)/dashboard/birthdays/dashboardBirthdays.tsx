"use client";

import { useEffect, useMemo, useState } from "react";
import { Cake, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { copyText, openInNewTab, toWhatsAppNumber, whatsappChatUrl } from "@/lib/whatsapp";
import { birthdayMessage } from "./constants";
import {
    buildMonthEntries,
    capitalize,
    currentMonth,
    describeEntry,
    firstName,
    initials,
    isSameMonth,
    monthLabel,
    parseBirthDate,
    shiftMonth,
} from "./birthdays";
import type { BirthdayEntry, BirthdayMember, MonthRef } from "./types";

const PAGE_SIZE = 1000; // limite por consulta do Supabase

// Membros ativos com data de nascimento (as regras do banco já limitam à igreja do usuário)
async function fetchBirthdayMembers(): Promise<BirthdayMember[]> {
    const result: BirthdayMember[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
            .from("members")
            .select("id, name, phone, birth_date")
            .eq("is_active", true)
            .not("birth_date", "is", null)
            .order("name")
            .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;

        for (const row of data ?? []) {
            const birthDate = row.birth_date ? String(row.birth_date).slice(0, 10) : null;
            if (!birthDate || !parseBirthDate(birthDate)) continue;
            result.push({ id: String(row.id), name: row.name?.trim() || "Sem nome", phone: row.phone ?? null, birthDate });
        }

        if (!data || data.length < PAGE_SIZE) break;
    }

    return result;
}

// Abre o WhatsApp com a mensagem pronta; sem telefone, copia a mensagem
async function greet(member: BirthdayMember, churchName: string) {
    const message = birthdayMessage(firstName(member.name), churchName);
    const number = toWhatsAppNumber(member.phone);

    if (number) {
        openInNewTab(whatsappChatUrl(number, message));
        return;
    }

    if (await copyText(message)) toast.success("Sem telefone no cadastro. A mensagem foi copiada.");
    else toast.error("Sem telefone no cadastro.");
}

export function DashboardBirthdays({ churchName }: { churchName: string }) {
    const [members, setMembers] = useState<BirthdayMember[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [now] = useState(() => new Date());
    const [month, setMonth] = useState<MonthRef>(() => currentMonth(now));

    useEffect(() => {
        fetchBirthdayMembers()
            .then(setMembers)
            .catch(() => setFailed(true));
    }, []);

    const entries = useMemo(() => buildMonthEntries(members ?? [], month, now), [members, month, now]);
    const isCurrent = isSameMonth(month, currentMonth(now));
    const today = entries.filter((e) => e.status === "today");
    const others = isCurrent ? entries.filter((e) => e.status !== "today") : entries;

    // Igreja sem nenhuma data de nascimento: o card não aparece
    if (members !== null && members.length === 0 && !failed) return null;

    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#E6FFFA] flex items-center justify-center shrink-0">
                    <Cake className="w-5 h-5 text-[#0F766E]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-700">Aniversariantes</h3>
                    <p className="text-xs text-gray-500">
                        {members === null
                            ? "Carregando..."
                            : `${entries.length === 0 ? "Nenhum" : entries.length} em ${monthLabel(month, now)}`}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setMonth((m) => shiftMonth(m, -1))}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {!isCurrent && (
                        <button
                            onClick={() => setMonth(currentMonth(now))}
                            className="px-2 h-8 rounded-lg text-xs font-semibold text-[#0F766E] hover:bg-[#E6FFFA]"
                        >
                            Este mês
                        </button>
                    )}
                    <button
                        onClick={() => setMonth((m) => shiftMonth(m, 1))}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {failed ? (
                <p className="text-sm text-gray-500 text-center py-6">Não foi possível carregar os aniversariantes.</p>
            ) : members === null ? (
                <p className="text-sm text-gray-500 text-center py-6">Carregando...</p>
            ) : (
                <>
                    {isCurrent && today.length > 0 && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-3 space-y-2">
                            <p className="text-sm font-semibold text-amber-800">
                                🎉 {today.length === 1 ? "Aniversário hoje" : `${today.length} aniversários hoje`}
                            </p>
                            {today.map((e) => (
                                <BirthdayRow key={e.id} entry={e} churchName={churchName} highlight />
                            ))}
                        </div>
                    )}

                    {others.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            {isCurrent && today.length > 0
                                ? "Nenhum outro aniversário este mês."
                                : `Nenhum aniversariante em ${monthLabel(month, now)}.`}
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                            {others.map((e) => (
                                <li key={e.id}>
                                    <BirthdayRow entry={e} churchName={churchName} />
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}

function BirthdayRow({ entry, churchName, highlight }: { entry: BirthdayEntry; churchName: string; highlight?: boolean }) {
    const past = entry.status === "past";

    return (
        <div className={`flex items-center gap-3 ${highlight ? "" : "py-2.5"} ${past ? "opacity-60" : ""}`}>
            <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    highlight ? "bg-white text-amber-700" : "bg-[#E6FFFA] text-[#0F766E]"
                }`}
            >
                {initials(entry.name)}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{entry.name}</p>
                <p className="text-xs text-gray-500">{capitalize(describeEntry(entry))}</p>
            </div>
            <button
                    onClick={() => greet(entry, churchName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1EBE5A] whitespace-nowrap"
                    title="Dar parabéns pelo WhatsApp"
                >
                    <MessageCircle className="w-4 h-4" />
                    Parabéns
                </button>
        </div>
    );
}
