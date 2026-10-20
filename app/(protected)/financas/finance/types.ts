export type AccountKind = "caixa" | "banco" | "outro";

// Conta com o saldo atual (vem da função finance_account_balances)
export type FinanceAccount = {
    id: string;
    name: string;
    kind: AccountKind;
    is_default: boolean;
    is_active: boolean;
    opening_balance: number;
    balance: number;
};

export type AccountInput = {
    name: string;
    kind: AccountKind;
    opening_balance: number;
    is_active?: boolean;
};

export type TransferInput = {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    transfer_date: string; // AAAA-MM-DD
    note?: string | null;
};

export type RecurringExpense = {
    id: string;
    description: string;
    category: string;
    amount: number;
    day_of_month: number;
    account_id: string | null;
    start_month: string; // AAAA-MM-01
    end_month: string | null;
    is_active: boolean;
};

export type RecurringInput = Omit<RecurringExpense, "id">;

export type RecurringPayment = {
    id: string;
    recurring_id: string;
    amount: number;
    created_at: string;
};

export type RecurringStatus = {
    item: RecurringExpense;
    dueDate: Date;
    payment: RecurringPayment | null;
    state: "paid" | "overdue" | "today" | "upcoming";
};

export type MemberOption = {
    id: string;
    name: string;
};

export type Contribution = {
    id: string;
    type: "entrada" | "saida";
    category: string | null;
    amount: number;
    created_at: string;
    account_id: string | null;
};

export const ACCOUNT_KIND_LABEL: Record<AccountKind, string> = {
    caixa: "Caixa (dinheiro)",
    banco: "Banco",
    outro: "Outra",
};

export const ACCOUNT_KIND_ICON: Record<AccountKind, "dollar-sign" | "credit-card" | "briefcase"> = {
    caixa: "dollar-sign",
    banco: "credit-card",
    outro: "briefcase",
};
