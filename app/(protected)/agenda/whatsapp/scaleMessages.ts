// Mensagens de WhatsApp da escala (mesmo texto do app)
import type { ScaleShareData, ScalePerson } from "./types";

// Página pública do site onde o escalado confirma ou recusa (sem login)
export const CONFIRM_BASE_URL = "https://ministerio360.vercel.app/confirmar/";

export function confirmLink(token: string) {
    return `${CONFIRM_BASE_URL}${token}`;
}

const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

// Valores provisórios que o cabeçalho usa enquanto carrega ou quando falha
const PLACEHOLDER_CHURCH_NAMES = ["Carregando...", "Igreja não definida", "Sem nome", "Erro ao carregar"];

function cleanChurchName(name?: string | null) {
    const value = name?.trim();
    return value && !PLACEHOLDER_CHURCH_NAMES.includes(value) ? value : null;
}

// "2026-10-25T12:00:00" -> "domingo, 25/10/2026" (sem passar por fuso horário)
export function formatScaleDate(value: string) {
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return value;
    const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
    return `${weekday}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export function firstName(name: string) {
    const first = name.trim().split(/\s+/)[0] ?? "";
    if (!first) return "";
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function joinNames(names: string[]) {
    if (names.length <= 1) return names[0] ?? "";
    return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

// Mensagem para uma pessoa escalada
export function personMessage(data: ScaleShareData, person: ScalePerson, churchName?: string | null) {
    const church = cleanChurchName(churchName);
    const name = firstName(person.name);
    const ministries = joinNames(person.ministries);

    const lines = [
        `Olá${name ? `, ${name}` : ""}! 👋`,
        "",
        "Você está na escala para servir:",
        "",
        `📅 ${formatScaleDate(data.date)}`,
        `⛪ ${data.event || "Evento"}`,
    ];

    if (ministries) lines.push(`🙌 Ministério: ${ministries}`);
    if (data.responsible?.trim()) lines.push(`👤 Responsável: ${data.responsible.trim()}`);

    if (person.token) {
        lines.push("", "✅ Confirme sua presença (ou avise se não puder) neste link:", confirmLink(person.token));
        lines.push("", "Contamos com você! 🙏");
    } else {
        lines.push("", "Contamos com você! Se não puder comparecer, avise o responsável o quanto antes. 🙏");
    }
    if (church) lines.push("", `_${church}_`);

    return lines.join("\n");
}

// "hoje", "amanhã" ou "domingo, 15/11/2026", contado a partir de agora
export function whenLabel(value: string, now = new Date()) {
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return formatScaleDate(value);
    const day = new Date(y, m - 1, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((day.getTime() - today.getTime()) / 86_400_000);
    const date = formatScaleDate(value);
    if (diff === 0) return `hoje (${date})`;
    if (diff === 1) return `amanhã (${date})`;
    return date;
}

// Lembrete para quem ainda não confirmou presença
export function reminderMessage(data: ScaleShareData, person: ScalePerson, churchName?: string | null, now = new Date()) {
    const church = cleanChurchName(churchName);
    const name = firstName(person.name);
    const ministries = joinNames(person.ministries);

    const lines = [
        `Olá${name ? `, ${name}` : ""}! 👋`,
        "",
        `Passando para lembrar: você está na escala de ${whenLabel(data.date, now)}.`,
        "",
        `⛪ ${data.event || "Evento"}`,
    ];

    if (ministries) lines.push(`🙌 Ministério: ${ministries}`);

    if (person.token) {
        lines.push("", "Ainda não recebemos sua resposta. Confirme (ou avise se não puder) neste link:", confirmLink(person.token));
    } else {
        lines.push("", "Ainda não recebemos sua resposta. Pode confirmar se vai conseguir ir?");
    }
    lines.push("", "Obrigado! 🙏");
    if (church) lines.push("", `_${church}_`);

    return lines.join("\n");
}

// Mensagem com a escala completa, para mandar em um grupo
export function groupMessage(data: ScaleShareData, churchName?: string | null) {
    const church = cleanChurchName(churchName);

    const lines = [
        `📋 *Escala – ${data.event || "Evento"}*`,
        `📅 ${formatScaleDate(data.date)}`,
    ];

    if (data.responsible?.trim()) lines.push(`👤 Responsável: ${data.responsible.trim()}`);

    for (const group of data.byMinistry) {
        lines.push("", `*${group.ministry}*`);
        if (group.members.length === 0) {
            lines.push("• (ninguém escalado)");
        } else {
            for (const member of group.members) lines.push(`• ${member}`);
        }
    }

    lines.push("", "Cada escalado recebe no privado o link para confirmar presença.", "Contamos com todos! 🙏");
    if (church) lines.push(`_${church}_`);

    return lines.join("\n");
}
