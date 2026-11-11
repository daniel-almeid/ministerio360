"use client";

import { supabase } from "../../../../lib/supabaseClient";
import { fetchMemberContributions } from "../finance/financeService";
import {
    buildReceiptHtml,
    buildStatementHtml,
    categoryLabel,
    escapeHtml,
    type ChurchIdentity,
    type ReceiptData,
} from "./receiptHtml";

// Recibo e informe anual (o mesmo documento do app). No computador abre a janela de impressão,
// onde dá para imprimir ou escolher "Salvar como PDF".

// Nome, CNPJ e endereço da igreja (Configurações). Sem dados, usa o nome do cadastro.
export async function fetchChurchIdentity(): Promise<ChurchIdentity> {
    const { data: sessionData } = await supabase.auth.getSession();
    const churchId = sessionData.session?.user?.app_metadata?.church_id as string | undefined;

    const [{ data: info }, { data: profile }] = await Promise.all([
        churchId
            ? supabase
                  .from("church_institutional_info")
                  .select("trade_name, corporate_name, cnpj, address, phone, email")
                  .eq("church_id", churchId)
                  .maybeSingle()
            : Promise.resolve({ data: null }),
        churchId
            ? supabase.from("church_profiles").select("name").eq("id", churchId).maybeSingle()
            : Promise.resolve({ data: null }),
    ]);

    const clean = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    return {
        name: clean(info?.trade_name) ?? clean(info?.corporate_name) ?? clean(profile?.name) ?? "Igreja",
        cnpj: clean(info?.cnpj),
        address: clean(info?.address),
        phone: clean(info?.phone),
        email: clean(info?.email),
    };
}

// "Maria da Silva" -> "Maria-da-Silva" (nome de arquivo sem acento nem espaço)
export function fileSafe(text: string) {
    return (
        text
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^A-Za-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 40) || "contribuinte"
    );
}

// Põe o título (vira o nome sugerido do PDF) e tira as margens do navegador (sem endereço/data no papel)
export function preparePrintHtml(html: string, title: string) {
    const extra = `<title>${escapeHtml(title)}</title><style>@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>`;
    return html.replace("<head>", `<head>${extra}`);
}

// Abre a impressão de um HTML num quadro invisível, sem sair da página
export function printHtml(html: string, title: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const frame = document.createElement("iframe");
        frame.setAttribute("aria-hidden", "true");
        frame.style.position = "fixed";
        frame.style.right = "0";
        frame.style.bottom = "0";
        frame.style.width = "0";
        frame.style.height = "0";
        frame.style.border = "0";

        const previousTitle = document.title;
        const cleanup = () => {
            document.title = previousTitle;
            setTimeout(() => frame.remove(), 1000);
        };

        frame.onload = () => {
            const win = frame.contentWindow;
            if (!win) {
                cleanup();
                reject(new Error("Impressão indisponível."));
                return;
            }
            // Alguns navegadores usam o título da página principal como nome do arquivo
            document.title = title;
            win.addEventListener("afterprint", cleanup, { once: true });
            setTimeout(() => {
                try {
                    win.focus();
                    win.print();
                    resolve();
                } catch (err) {
                    cleanup();
                    reject(err);
                }
            }, 50);
        };

        frame.srcdoc = preparePrintHtml(html, title);
        document.body.appendChild(frame);
    });
}

function monthKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Recibo de um lançamento de entrada
export async function printReceipt(r: ReceiptData) {
    const church = await fetchChurchIdentity();
    const title = `Recibo-${fileSafe(categoryLabel(r.category))}-${fileSafe(r.personName)}-${monthKey(r.date)}`;
    await printHtml(buildReceiptHtml(church, r), title);
}

// Informe anual de contribuições de um membro
export async function printAnnualStatement(member: { id: string; name: string }, year: number) {
    const [church, items] = await Promise.all([fetchChurchIdentity(), fetchMemberContributions(member.id)]);
    const entradas = items
        .filter((c) => c.type === "entrada")
        .map((c) => ({ category: c.category, amount: Number(c.amount), date: c.created_at }));

    await printHtml(
        buildStatementHtml(church, member.name, year, entradas),
        `Informe-de-contribuicoes-${year}-${fileSafe(member.name)}`
    );
}
