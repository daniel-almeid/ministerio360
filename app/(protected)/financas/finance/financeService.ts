import { supabase } from "@/lib/supabaseClient";
import type {
    AccountInput,
    Contribution,
    FinanceAccount,
    MemberOption,
    RecurringExpense,
    RecurringInput,
    RecurringPayment,
    TransferInput,
} from "./types";

// Mensagem amigável para os erros mais comuns do banco
export function financeErrorMessage(error: any, fallback: string) {
    const code = error?.code;
    const message = String(error?.message ?? "");
    if (code === "23505" && message.includes("finance_accounts")) return "Já existe uma conta com esse nome.";
    if (code === "23505" && message.includes("recurring_once")) return "Essa conta já foi paga neste mês.";
    if (code === "23503") return "Essa conta tem lançamentos. Desative-a em vez de excluir.";
    if (message.includes("conta padrão")) return "A conta padrão não pode ser excluída.";
    return fallback;
}

// ------------------------------------------------------------------ contas

export async function fetchAccounts(): Promise<FinanceAccount[]> {
    const { data, error } = await supabase.rpc("finance_account_balances");
    if (error) throw error;

    return (data ?? []).map((row: any) => ({
        id: row.account_id,
        name: row.name,
        kind: row.kind,
        is_default: row.is_default,
        is_active: row.is_active,
        opening_balance: Number(row.opening_balance ?? 0),
        balance: Number(row.balance ?? 0),
    }));
}

export async function createAccount(input: AccountInput) {
    const { error } = await supabase.from("finance_accounts").insert({
        name: input.name.trim(),
        kind: input.kind,
        opening_balance: input.opening_balance,
        is_active: input.is_active ?? true,
    });
    if (error) throw error;
}

export async function updateAccount(id: string, input: Partial<AccountInput>) {
    const patch: Record<string, unknown> = { ...input };
    if (typeof input.name === "string") patch.name = input.name.trim();
    const { error } = await supabase.from("finance_accounts").update(patch).eq("id", id);
    if (error) throw error;
}

export async function deleteAccount(id: string) {
    const { error } = await supabase.from("finance_accounts").delete().eq("id", id);
    if (error) throw error;
}

export async function createTransfer(input: TransferInput) {
    const { error } = await supabase.from("finance_transfers").insert({
        from_account_id: input.from_account_id,
        to_account_id: input.to_account_id,
        amount: input.amount,
        transfer_date: input.transfer_date,
        note: input.note?.trim() || null,
    });
    if (error) throw error;
}

// Transferências de um mês ("AAAA-MM"), para o relatório em PDF
export async function fetchTransfers(ym: string) {
    const [y, m] = ym.split("-").map(Number);
    const first = `${ym}-01`;
    const last = `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;

    const { data, error } = await supabase
        .from("finance_transfers")
        .select("id, from_account_id, to_account_id, amount, transfer_date, note")
        .gte("transfer_date", first)
        .lte("transfer_date", last)
        .order("transfer_date");

    if (error) throw error;
    return (data ?? []).map((row: any) => ({ ...row, amount: Number(row.amount) }));
}

// ------------------------------------------------------- despesas recorrentes

export async function fetchRecurring(): Promise<RecurringExpense[]> {
    const { data, error } = await supabase
        .from("recurring_expenses")
        .select("id, description, category, amount, day_of_month, account_id, start_month, end_month, is_active")
        .order("day_of_month")
        .order("description");

    if (error) throw error;
    return (data ?? []).map((row: any) => ({ ...row, amount: Number(row.amount) }));
}

export async function saveRecurring(input: RecurringInput, id?: string): Promise<string> {
    const payload = { ...input, description: input.description.trim() };

    if (id) {
        const { error } = await supabase.from("recurring_expenses").update(payload).eq("id", id);
        if (error) throw error;
        return id;
    }

    const { data, error } = await supabase.from("recurring_expenses").insert(payload).select("id").single();
    if (error) throw error;
    return data.id as string;
}

export async function deleteRecurring(id: string) {
    const { error } = await supabase.from("recurring_expenses").delete().eq("id", id);
    if (error) throw error;
}

// Pagamentos de contas recorrentes de um mês (recurring_month = "AAAA-MM-01")
export async function fetchRecurringPayments(month: string): Promise<RecurringPayment[]> {
    const { data, error } = await supabase
        .from("transactions")
        .select("id, recurring_id, amount, created_at")
        .eq("recurring_month", month)
        .not("recurring_id", "is", null);

    if (error) throw error;
    return (data ?? []).map((row: any) => ({ ...row, amount: Number(row.amount) }));
}

// Marca a conta do mês como paga: vira uma saída normal, ligada à despesa recorrente
export async function payRecurring(item: RecurringExpense, month: string, amount: number, accountId: string | null) {
    const { error } = await supabase.from("transactions").insert({
        type: "saida",
        category: item.category,
        person_name: item.description,
        amount,
        account_id: accountId,
        recurring_id: item.id,
        recurring_month: month,
    });
    if (error) throw error;
}

// ------------------------------------------------------------------ membros

export async function fetchActiveMembers(): Promise<MemberOption[]> {
    const result: MemberOption[] = [];
    const PAGE = 1000;

    for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
            .from("members")
            .select("id, name")
            .eq("is_active", true)
            .order("name")
            .range(from, from + PAGE - 1);

        if (error) throw error;
        result.push(...((data ?? []) as MemberOption[]));
        if (!data || data.length < PAGE) break;
    }

    return result;
}

export async function fetchMemberContributions(memberId: string): Promise<Contribution[]> {
    const { data, error } = await supabase
        .from("transactions")
        .select("id, type, category, amount, created_at, account_id")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row: any) => ({ ...row, amount: Number(row.amount) }));
}
