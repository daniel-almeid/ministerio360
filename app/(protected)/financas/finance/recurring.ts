import type { RecurringExpense, RecurringPayment, RecurringStatus } from "./types";

// "2026-10" -> "2026-10-01"
export function monthStart(ym: string) {
    return `${ym.slice(0, 7)}-01`;
}

export function currentYearMonth(now: Date = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

// A despesa vale para o mês? (ativa, já começou e ainda não terminou)
export function appliesToMonth(item: RecurringExpense, ym: string) {
    if (!item.is_active) return false;
    const month = monthStart(ym);
    if (item.start_month.slice(0, 10) > month) return false;
    if (item.end_month && item.end_month.slice(0, 10) < month) return false;
    return true;
}

// Vencimento no mês (dia 31 vira o último dia em meses menores)
export function dueDateFor(item: RecurringExpense, ym: string) {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, Math.min(item.day_of_month, daysInMonth(y, m)));
}

export function buildRecurringStatus(
    items: RecurringExpense[],
    payments: RecurringPayment[],
    ym: string,
    now: Date = new Date()
): RecurringStatus[] {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return items
        .filter((item) => appliesToMonth(item, ym))
        .map((item) => {
            const dueDate = dueDateFor(item, ym);
            const payment = payments.find((p) => p.recurring_id === item.id) ?? null;
            const due = dueDate.getTime();

            const state: RecurringStatus["state"] = payment
                ? "paid"
                : due < today
                ? "overdue"
                : due === today
                ? "today"
                : "upcoming";

            return { item, dueDate, payment, state };
        })
        .sort((a, b) => {
            // pendentes primeiro, por vencimento; pagas no fim
            if (!!a.payment !== !!b.payment) return a.payment ? 1 : -1;
            return a.dueDate.getTime() - b.dueDate.getTime();
        });
}
