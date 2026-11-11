// Membro com data de nascimento (só os ativos entram na lista)
export type BirthdayMember = {
    id: string;
    name: string;
    phone: string | null;
    birthDate: string; // "YYYY-MM-DD"
};

// Situação do aniversário em relação a hoje
export type BirthdayStatus = "past" | "today" | "tomorrow" | "upcoming";

export type BirthdayEntry = BirthdayMember & {
    day: number; // dia em que cai no mês exibido (29/02 vira 28/02 em ano não bissexto)
    month: number; // 1 a 12
    age: number | null; // idade que completa neste aniversário (null se o ano não for confiável)
    status: BirthdayStatus;
};

// Mês exibido na lista
export type MonthRef = {
    year: number;
    month: number; // 1 a 12
};
