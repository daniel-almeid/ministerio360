"use client";

import { useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FolderOpen,
    Loader2,
    Upload,
    X,
} from "lucide-react";
import { readTable } from "./spreadsheet";
import { buildImportPreview, ImportError } from "./memberImportParser";
import { insertMembers, loadImportContext } from "./memberImportService";
import type { ImportPreview, ImportResult, ImportRow, ImportRowStatus } from "./memberImport";

type Step = "intro" | "reading" | "review" | "importing" | "done";
type Filter = "all" | "ok" | "warning" | "skip";

const COLUMNS = [
    { name: "Nome", hint: "obrigatório" },
    { name: "Telefone", hint: "(11) 98888-1020" },
    { name: "E-mail", hint: "" },
    { name: "Data de nascimento", hint: "dd/mm/aaaa" },
    { name: "Ministério", hint: "se não existir, é criado" },
    { name: "Status", hint: "Ativo ou Inativo" },
];

// Modelo em CSV com ";" (abre direto em colunas no Excel em português)
const TEMPLATE_ROWS = [
    ["Nome", "Telefone", "E-mail", "Data de nascimento", "Ministério", "Status"],
    ["Maria da Silva", "(11) 98888-1020", "maria@email.com", "14/03/1992", "Louvor", "Ativo"],
    ["João Pereira", "(11) 97777-2030", "", "02/08/1985", "", "Ativo"],
];

function downloadTemplate() {
    const BOM = "﻿"; // faz o Excel reconhecer os acentos (UTF-8)
    const content = BOM + TEMPLATE_ROWS.map((r) => r.join(";")).join("\r\n") + "\r\n";
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-membros-ministerio360.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const STATUS_STYLE: Record<ImportRowStatus, { label: string; className: string }> = {
    ok: { label: "Pronto", className: "bg-[#E6FFFA] text-[#0F766E]" },
    warning: { label: "Com aviso", className: "bg-amber-50 text-amber-700" },
    duplicate: { label: "Já cadastrado", className: "bg-gray-100 text-gray-600" },
    error: { label: "Não entra", className: "bg-red-50 text-red-700" },
};

function plural(n: number, one: string, many: string) {
    return `${n} ${n === 1 ? one : many}`;
}

export default function ImportMembersModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
    const [step, setStep] = useState<Step>("intro");
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const [result, setResult] = useState<ImportResult | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const inputRef = useRef<HTMLInputElement>(null);

    const busy = step === "reading" || step === "importing";

    async function readFile(file: File) {
        setError(null);
        setStep("reading");
        try {
            const [buffer, context] = await Promise.all([file.arrayBuffer(), loadImportContext()]);
            const table = await readTable(file.name, new Uint8Array(buffer));
            setPreview(buildImportPreview(file.name, table, context.names, context.ministries));
            setFilter("all");
            setStep("review");
        } catch (err) {
            setError(
                err instanceof ImportError
                    ? err.message
                    : "Não conseguimos ler este arquivo. Use uma planilha do Excel (.xlsx) ou CSV."
            );
            setStep("intro");
        }
    }

    const toImport = useMemo(
        () => (preview?.rows ?? []).filter((r) => r.status === "ok" || r.status === "warning"),
        [preview]
    );

    async function startImport() {
        if (!preview || toImport.length === 0) return;
        setStep("importing");
        setProgress({ done: 0, total: toImport.length });
        const skipped = preview.counts.duplicate + preview.counts.error;
        try {
            const res = await insertMembers(toImport, preview.newMinistries, (done, total) => setProgress({ done, total }));
            setResult({ ...res, skipped });
        } catch {
            setResult({
                imported: 0,
                failed: toImport.map((r) => ({ line: r.line, name: r.data.name, reason: "Falha de conexão" })),
                skipped,
                createdMinistries: [],
                ministryErrors: [],
            });
        } finally {
            setStep("done");
            onDone();
        }
    }

    const visibleRows = useMemo(() => {
        const rows = preview?.rows ?? [];
        if (filter === "ok") return rows.filter((r) => r.status === "ok");
        if (filter === "warning") return rows.filter((r) => r.status === "warning");
        if (filter === "skip") return rows.filter((r) => r.status === "duplicate" || r.status === "error");
        return rows;
    }, [preview, filter]);

    const stepLabel =
        step === "intro" || step === "reading"
            ? "Passo 1 de 2 · Escolher arquivo"
            : step === "review"
              ? "Passo 2 de 2 · Conferir"
              : step === "importing"
                ? "Importando"
                : "Concluído";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-[#E6FFFA] flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-5 h-5 text-[#0F766E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-800">Importar membros</h2>
                        <p className="text-xs text-gray-500">{stepLabel}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={step === "importing"}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40"
                        aria-label="Fechar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls,.ods,.csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) readFile(file);
                    }}
                />

                <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    {(step === "intro" || step === "reading") && (
                        <>
                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-bold text-[#1E3A5F]">Traga sua planilha</h3>
                                <p className="text-sm text-gray-500">
                                    Cadastre todos os membros de uma vez com um arquivo do Excel (.xlsx) ou CSV.
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="font-semibold text-gray-800">Colunas reconhecidas</p>
                                <p className="text-xs text-gray-500 mb-2">
                                    Os títulos ficam na primeira linha. Só “Nome” é obrigatório; as outras são opcionais.
                                </p>
                                <div className="divide-y divide-gray-100">
                                    {COLUMNS.map((c) => (
                                        <div key={c.name} className="flex items-center justify-between py-1.5 text-sm">
                                            <span className="text-gray-700">{c.name}</span>
                                            {c.hint && (
                                                <span
                                                    className={
                                                        c.hint === "obrigatório"
                                                            ? "text-[#0F766E] font-semibold text-xs"
                                                            : "text-gray-400 text-xs"
                                                    }
                                                >
                                                    {c.hint}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={downloadTemplate}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline"
                            >
                                <Download className="w-4 h-4" />
                                Baixar modelo de planilha
                            </button>

                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                disabled={step === "reading"}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) readFile(file);
                                }}
                                className="w-full rounded-xl border-2 border-dashed border-[#9EDBD5] bg-[#F5FBFA] hover:bg-[#E6FFFA] py-8 flex flex-col items-center gap-2 text-[#0F766E] disabled:opacity-70"
                            >
                                {step === "reading" ? (
                                    <>
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                        <span className="font-semibold">Lendo a planilha...</span>
                                    </>
                                ) : (
                                    <>
                                        <FolderOpen className="w-7 h-7" />
                                        <span className="font-semibold">Escolher arquivo</span>
                                        <span className="text-xs text-gray-500">ou arraste a planilha para cá</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {step === "review" && preview && (
                        <>
                            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                                <FileSpreadsheet className="w-5 h-5 text-[#0F766E] shrink-0" />
                                <span className="flex-1 min-w-0 truncate text-sm font-medium text-gray-700">
                                    {preview.fileName}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="text-sm font-semibold text-[#0F766E] hover:underline"
                                >
                                    Trocar
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-xl bg-[#E6FFFA] px-3 py-2">
                                    <p className="text-xs text-gray-500">Prontos</p>
                                    <p className="text-lg font-bold text-[#0F766E]">{preview.counts.ok}</p>
                                </div>
                                <div className="rounded-xl bg-amber-50 px-3 py-2">
                                    <p className="text-xs text-gray-500">Com aviso</p>
                                    <p className="text-lg font-bold text-amber-700">{preview.counts.warning}</p>
                                </div>
                                <div className="rounded-xl bg-gray-100 px-3 py-2">
                                    <p className="text-xs text-gray-500">Não entram</p>
                                    <p className="text-lg font-bold text-gray-700">
                                        {preview.counts.duplicate + preview.counts.error}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">
                                Colunas reconhecidas: {Object.values(preview.columns).join(", ") || "nenhuma"}
                                {preview.ignoredColumns.length > 0 && <> · Ignoradas: {preview.ignoredColumns.join(", ")}</>}
                            </p>

                            {preview.newMinistries.length > 0 && (
                                <p className="text-sm rounded-lg bg-[#F5FBFA] border border-[#CFE6E2] px-3 py-2 text-gray-700">
                                    {preview.newMinistries.length === 1 ? "Ministério novo" : "Ministérios novos"} (serão
                                    criados): <strong>{preview.newMinistries.join(", ")}</strong>
                                </p>
                            )}

                            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
                                {(
                                    [
                                        ["all", "Todas"],
                                        ["ok", "Prontos"],
                                        ["warning", "Com aviso"],
                                        ["skip", "Não entram"],
                                    ] as [Filter, string][]
                                ).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFilter(key)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            filter === key ? "bg-[#38B2AC] text-white" : "text-gray-600 hover:text-[#38B2AC]"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                                {visibleRows.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-6">Nenhuma linha neste filtro.</p>
                                ) : (
                                    visibleRows.slice(0, 300).map((r) => <ReviewRow key={r.line} row={r} />)
                                )}
                                {visibleRows.length > 300 && (
                                    <p className="text-xs text-gray-500 text-center py-2">
                                        Mostrando 300 de {visibleRows.length} linhas.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {step === "importing" && (
                        <div className="py-10 text-center space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0F766E] mx-auto" />
                            <p className="font-semibold text-gray-800">Importando membros...</p>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden max-w-sm mx-auto">
                                <div
                                    className="h-full bg-[#0F766E] transition-all"
                                    style={{
                                        width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%`,
                                    }}
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                {progress.done} de {progress.total} · Não feche esta janela até terminar.
                            </p>
                        </div>
                    )}

                    {step === "done" && result && (
                        <div className="space-y-3">
                            <div className="text-center py-4 space-y-2">
                                {result.imported > 0 ? (
                                    <CheckCircle2 className="w-10 h-10 text-[#0F766E] mx-auto" />
                                ) : (
                                    <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
                                )}
                                <p className="text-lg font-bold text-[#1E3A5F]">
                                    {result.imported > 0
                                        ? `${plural(result.imported, "membro importado", "membros importados")}`
                                        : "Nenhum membro foi importado"}
                                </p>
                                {result.skipped > 0 && (
                                    <p className="text-sm text-gray-500">
                                        {plural(result.skipped, "linha ficou de fora", "linhas ficaram de fora")} (já
                                        cadastrados ou sem nome).
                                    </p>
                                )}
                            </div>

                            {result.createdMinistries.length > 0 && (
                                <p className="text-sm rounded-lg bg-[#E6FFFA] px-3 py-2 text-gray-700">
                                    {result.createdMinistries.length === 1 ? "Ministério criado: " : "Ministérios criados: "}
                                    <strong>{result.createdMinistries.join(", ")}</strong>
                                </p>
                            )}

                            {result.ministryErrors.length > 0 && (
                                <p className="text-sm rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                                    Não foi possível criar: {result.ministryErrors.join(", ")}. Esses membros entraram sem
                                    ministério.
                                </p>
                            )}

                            {result.failed.length > 0 && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 space-y-1">
                                    <p className="font-semibold">
                                        {plural(result.failed.length, "linha não entrou", "linhas não entraram")}:
                                    </p>
                                    <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                                        {result.failed.slice(0, 50).map((f) => (
                                            <li key={f.line}>
                                                Linha {f.line} · {f.name}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs">
                                        Confira a conexão e tente importar a planilha de novo — quem já entrou não será
                                        duplicado.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    {step === "review" && (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={startImport}
                                disabled={toImport.length === 0}
                                className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {toImport.length === 0
                                    ? "Nenhum membro para importar"
                                    : `Importar ${plural(toImport.length, "membro", "membros")}`}
                            </button>
                        </>
                    )}
                    {(step === "intro" || step === "reading") && (
                        <button
                            onClick={onClose}
                            disabled={busy}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    )}
                    {step === "done" && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                        >
                            Concluir
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReviewRow({ row }: { row: ImportRow }) {
    const s = STATUS_STYLE[row.status];
    const d = row.data;
    const details = [d.phone, d.email, d.birth_date?.split("-").reverse().join("/"), d.ministry_name, d.is_active ? null : "Inativo"]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="flex items-start gap-3 px-3 py-2">
            <span className="text-xs text-gray-400 w-12 shrink-0 pt-0.5">Linha {row.line}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{d.name || "Sem nome"}</p>
                {details && <p className="text-xs text-gray-500 truncate">{details}</p>}
                {row.issues.map((issue) => (
                    <p key={issue} className="text-xs text-amber-700">
                        {issue}
                    </p>
                ))}
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${s.className}`}>
                {s.label}
            </span>
        </div>
    );
}
