import { MONTH_NAMES } from "./constants";
import type { BirthdayEntry, BirthdayMember, BirthdayStatus, MonthRef } from "./types";

const DAY_MS = 86_400_000;

// "1992-03-14" (ou "1992-03-14T00:00:00") -> { year, month, day }, sem passar por fuso horário
export function parseBirthDate(value: string | null | undefined) {
    if (!value) return null;

    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;

    return { year: y, month: m, day: d };
}

export function isLeapYear(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Dia em que o aniversário cai num determinado ano (29/02 vira 28/02 quando o ano não é bissexto)
export function birthdayDayIn(month: number, day: number, year: number) {
    if (month === 2 && day === 29 && !isLeapYear(year)) return 28;
    return day;
}

// Idade completada naquele ano; ignora anos claramente inválidos (ex.: 0001, ano futuro)
export function ageInYear(birthYear: number, year: number) {
    if (birthYear < 1900 || birthYear > year) return null;
    return year - birthYear;
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function statusFor(date: Date, today: Date): BirthdayStatus {
    const diff = Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / DAY_MS);

    if (diff === 0) return "today";
    if (diff === 1) return "tomorrow";
    return diff < 0 ? "past" : "upcoming";
}

// Aniversariantes de um mês, em ordem de dia (e nome, no empate)
export function buildMonthEntries(
    members: BirthdayMember[],
    ref: MonthRef,
    now: Date = new Date()
): BirthdayEntry[] {
    const entries: BirthdayEntry[] = [];

    for (const member of members) {
        const birth = parseBirthDate(member.birthDate);
        if (!birth || birth.month !== ref.month) continue;

        const day = birthdayDayIn(birth.month, birth.day, ref.year);
        const date = new Date(ref.year, ref.month - 1, day);

        entries.push({
            ...member,
            day,
            month: ref.month,
            age: ageInYear(birth.year, ref.year),
            status: statusFor(date, now),
        });
    }

    return entries.sort((a, b) => a.day - b.day || a.name.localeCompare(b.name, "pt-BR"));
}

// Próximo aniversário a partir de hoje (inclui o de hoje)
export function nextBirthday(birthDate: string, now: Date = new Date()) {
    const birth = parseBirthDate(birthDate);
    if (!birth) return null;

    const today = startOfDay(now);

    for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
        const date = new Date(year, birth.month - 1, birthdayDayIn(birth.month, birth.day, year));
        if (date.getTime() >= today.getTime()) {
            return { date, age: ageInYear(birth.year, year) };
        }
    }

    return null;
}

export function currentMonth(now: Date = new Date()): MonthRef {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
    const index = ref.year * 12 + (ref.month - 1) + delta;
    return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function isSameMonth(a: MonthRef, b: MonthRef) {
    return a.year === b.year && a.month === b.month;
}

// "outubro" no ano atual; "janeiro de 2027" em outro ano
export function monthLabel(ref: MonthRef, now: Date = new Date()) {
    const name = MONTH_NAMES[ref.month - 1];
    return ref.year === now.getFullYear() ? name : `${name} de ${ref.year}`;
}

export function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function firstName(name: string) {
    const first = name.trim().split(/\s+/)[0] ?? "";
    return first ? capitalize(first.toLowerCase()) : "irmão(ã)";
}

export function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";

    const first = parts[0][0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
    return (first + last).toUpperCase();
}

// Junta nomes no estilo "Ana, Pedro e Júlia"
export function joinNames(names: string[]) {
    if (names.length <= 1) return names[0] ?? "";
    return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

// Texto curto que aparece abaixo do nome
export function describeEntry(entry: BirthdayEntry) {
    const age = entry.age;

    switch (entry.status) {
        case "today":
            return age ? `Hoje · ${age} anos` : "Hoje";
        case "tomorrow":
            return age ? `Amanhã · faz ${age} anos` : "Amanhã";
        case "past":
            return age ? `Dia ${entry.day} · fez ${age} anos` : `Dia ${entry.day}`;
        default:
            return age ? `Dia ${entry.day} · faz ${age} anos` : `Dia ${entry.day}`;
    }
}
