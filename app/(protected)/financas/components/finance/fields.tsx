"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, UserCheck, X } from "lucide-react";
import { fetchActiveMembers } from "../../finance/financeService";
import { formatBRL } from "../../finance/money";
import type { FinanceAccount, MemberOption } from "../../finance/types";
import { inputClass } from "./ui";

// Conta (só as ativas, mais a que já estiver selecionada)
export function AccountSelect({
    accounts,
    value,
    onChange,
    excludeId,
    placeholder = "Selecione a conta",
}: {
    accounts: FinanceAccount[];
    value: string | null;
    onChange: (id: string) => void;
    excludeId?: string | null;
    placeholder?: string;
}) {
    const options = accounts.filter((a) => (a.is_active || a.id === value) && a.id !== excludeId);
    return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {!value && <option value="">{placeholder}</option>}
            {options.map((a) => (
                <option key={a.id} value={a.id}>
                    {a.name} · {formatBRL(a.balance)}
                </option>
            ))}
        </select>
    );
}

const ACCENTS: Record<string, string> = {
    á: "a", à: "a", â: "a", ã: "a", ä: "a", é: "e", è: "e", ê: "e", ë: "e", í: "i", ì: "i", î: "i", ï: "i",
    ó: "o", ò: "o", ô: "o", õ: "o", ö: "o", ú: "u", ù: "u", û: "u", ü: "u", ç: "c", ñ: "n",
};
function normalize(text: string) {
    return text.toLowerCase().replace(/[^\u0000-\u007f]/g, (c) => ACCENTS[c] ?? c).trim();
}

// Busca de membro para vincular a entrada (dízimo, oferta...)
export function MemberPicker({
    value,
    onChange,
}: {
    value: MemberOption | null;
    onChange: (member: MemberOption | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [members, setMembers] = useState<MemberOption[] | null>(null);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open || members) return;
        fetchActiveMembers()
            .then(setMembers)
            .catch(() => setMembers([]));
    }, [open, members]);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = useMemo(() => {
        const q = normalize(query);
        const list = members ?? [];
        return (q ? list.filter((m) => normalize(m.name).includes(q)) : list).slice(0, 50);
    }, [members, query]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`${inputClass} flex items-center gap-2 text-left`}
            >
                <UserCheck className="w-4 h-4 text-gray-400 shrink-0" />
                <span className={`flex-1 truncate ${value ? "text-gray-700" : "text-gray-400"}`}>
                    {value?.name ?? "Vincular a um membro (opcional)"}
                </span>
                {value ? (
                    <X
                        className="w-4 h-4 text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                        }}
                    />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {open && (
                <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 z-50 animate-fadeIn">
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar pelo nome"
                            className="flex-1 text-sm outline-none text-gray-700"
                        />
                    </div>
                    <div className="max-h-56 overflow-auto custom-scrollbar">
                        {members === null ? (
                            <p className="text-sm text-gray-500 px-4 py-3">Carregando...</p>
                        ) : filtered.length === 0 ? (
                            <p className="text-sm text-gray-500 px-4 py-3">Nenhum membro encontrado.</p>
                        ) : (
                            filtered.map((m) => (
                                <div
                                    key={m.id}
                                    onClick={() => {
                                        onChange(m);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className={`px-4 py-2 cursor-pointer text-gray-700 hover:bg-[#E6FFFA] hover:text-[#2C7A7B] ${
                                        value?.id === m.id ? "bg-[#EDFDFD] text-[#2C7A7B]" : ""
                                    }`}
                                >
                                    {m.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
