"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAccounts, fetchRecurring, fetchRecurringPayments } from "./financeService";
import { buildRecurringStatus, monthStart } from "./recurring";
import type { FinanceAccount, RecurringExpense, RecurringPayment } from "./types";

// Saldos das contas + contas recorrentes do mês selecionado
export function useFinanceOverview(selectedMonth: string) {
    const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
    const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
    const [payments, setPayments] = useState<RecurringPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const reload = useCallback(async () => {
        setError(false);
        try {
            const [acc, rec, pay] = await Promise.all([
                fetchAccounts(),
                fetchRecurring(),
                fetchRecurringPayments(monthStart(selectedMonth)),
            ]);
            setAccounts(acc);
            setRecurring(rec);
            setPayments(pay);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        reload();
    }, [reload]);

    const activeAccounts = useMemo(() => accounts.filter((a) => a.is_active), [accounts]);
    const defaultAccount = useMemo(() => accounts.find((a) => a.is_default) ?? accounts[0] ?? null, [accounts]);
    const total = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);
    const statuses = useMemo(
        () => buildRecurringStatus(recurring, payments, selectedMonth),
        [recurring, payments, selectedMonth]
    );

    const accountName = useCallback(
        (id?: string | null) => (id ? accounts.find((a) => a.id === id)?.name ?? null : null),
        [accounts]
    );

    return {
        accounts,
        activeAccounts,
        defaultAccount,
        total,
        recurring,
        statuses,
        loading,
        error,
        reload,
        accountName,
    };
}

export type FinanceOverview = ReturnType<typeof useFinanceOverview>;
