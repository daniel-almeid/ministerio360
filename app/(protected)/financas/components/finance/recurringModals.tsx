"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, ChevronRight, Pencil, Plus, RefreshCw } from "lucide-react";
import {
    deleteRecurring,
    financeErrorMessage,
    payRecurring,
    saveRecurring,
} from "../../finance/financeService";
import { amountToInput, formatBRL, parseAmount } from "../../finance/money";
import { currentYearMonth, monthStart } from "../../finance/recurring";
import type { FinanceAccount, RecurringExpense, RecurringStatus } from "../../finance/types";
import { AccountSelect } from "./fields";
import { Field, inputClass, ModalShell, PrimaryButton, SecondaryButton } from "./ui";

export const EXPENSE_CATEGORIES = ["Contas", "Compras", "Eventos", "Missões", "Doações", "Outro..."];

// ----------------------------------------------------------- lista de fixas

export function RecurringListModal({
    items,
    accountName,
    onClose,
    onNew,
    onEdit,
}: {
    items: RecurringExpense[];
    accountName: (id?: string | null) => string | null;
    onClose: () => void;
    onNew: () => void;
    onEdit: (item: RecurringExpense) => void;
}) {
    return (
        <ModalShell
            title="Despesas fixas"
            subtitle="Aluguel, energia, água, internet..."
            icon={RefreshCw}
            onClose={onClose}
            wide
            footer={
                <PrimaryButton onClick={onNew}>
                    <Plus className="w-4 h-4" /> Nova despesa fixa
                </PrimaryButton>
            }
        >
            {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                    Nenhuma despesa fixa ainda. Cadastre as contas que se repetem todo mês para lembrar do vencimento.
                </p>
            ) : (
                <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onEdit(item)}
                            className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 rounded-lg px-1"
                        >
                            <div
                                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                                    item.is_active ? "bg-[#E6FFFA] text-[#0F766E]" : "bg-gray-100 text-gray-400"
                                }`}
                            >
                                <span className="text-[9px] leading-none text-gray-500">dia</span>
                                <span className="font-extrabold leading-tight">{item.day_of_month}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${item.is_active ? "text-gray-800" : "text-gray-400"}`}>
                                    {item.description}
                                    {!item.is_active && " (pausada)"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {item.category}
                                    {accountName(item.account_id) ? ` · ${accountName(item.account_id)}` : ""}
                                </p>
                            </div>
                            <span className="font-semibold text-gray-800">{formatBRL(item.amount)}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                    ))}
                </div>
            )}
        </ModalShell>
    );
}

// ------------------------------------------------- criar / editar despesa fixa

export function RecurringFormModal({
    item,
    accounts,
    defaultAccountId,
    onClose,
    onSaved,
}: {
    item: RecurringExpense | null;
    accounts: FinanceAccount[];
    defaultAccountId: string | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!item;
    const known = item ? EXPENSE_CATEGORIES.includes(item.category) : true;

    const [description, setDescription] = useState(item?.description ?? "");
    const [category, setCategory] = useState(item ? (known ? item.category : "Outro...") : "Contas");
    const [customCategory, setCustomCategory] = useState(item && !known ? item.category : "");
    const [amount, setAmount] = useState(amountToInput(item?.amount));
    const [day, setDay] = useState(String(item?.day_of_month ?? new Date().getDate()));
    const [accountId, setAccountId] = useState<string | null>(item?.account_id ?? defaultAccountId);
    const [active, setActive] = useState(item?.is_active ?? true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        const finalCategory = category === "Outro..." ? customCategory.trim() : category;
        const value = parseAmount(amount);
        const dayNumber = Number(day);

        if (!description.trim()) return setError("Informe a descrição (ex.: Aluguel).");
        if (!finalCategory) return setError("Informe a categoria.");
        if (!Number.isFinite(value) || value < 0) return setError("Informe um valor válido.");
        if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31) return setError("O dia do vencimento vai de 1 a 31.");

        setSaving(true);
        setError(null);
        try {
            await saveRecurring(
                {
                    description,
                    category: finalCategory,
                    amount: value,
                    day_of_month: dayNumber,
                    account_id: accountId,
                    start_month: item?.start_month ?? monthStart(currentYearMonth()),
                    end_month: item?.end_month ?? null,
                    is_active: active,
                },
                item?.id
            );
            toast.success(isEdit ? "Despesa fixa atualizada!" : "Despesa fixa criada!");
            onSaved();
            onClose();
        } catch (e) {
            setError(financeErrorMessage(e, "Não foi possível salvar a despesa fixa."));
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!item) return;
        setSaving(true);
        try {
            await deleteRecurring(item.id);
            toast.success("Despesa fixa excluída!");
            onSaved();
            onClose();
        } catch (e) {
            setError(financeErrorMessage(e, "Não foi possível excluir."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalShell
            title={isEdit ? "Editar despesa fixa" : "Nova despesa fixa"}
            subtitle="Aparece todo mês em “Contas do mês”"
            icon={isEdit ? Pencil : RefreshCw}
            onClose={onClose}
            error={error}
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton onClick={save} loading={saving}>
                        {isEdit ? "Salvar" : "Criar"}
                    </PrimaryButton>
                </>
            }
        >
            <Field label="Descrição">
                <input
                    className={inputClass}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex.: Aluguel, Energia"
                    autoFocus
                />
            </Field>

            <Field label="Categoria">
                <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </Field>
            {category === "Outro..." && (
                <input
                    className={inputClass}
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Digite a categoria"
                />
            )}

            <div className="grid grid-cols-2 gap-3">
                <Field label="Valor previsto">
                    <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" />
                </Field>
                <Field label="Dia do vencimento">
                    <input
                        className={inputClass}
                        value={day}
                        onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                        inputMode="numeric"
                    />
                </Field>
            </div>

            <Field label="Sai de qual conta">
                <AccountSelect accounts={accounts} value={accountId} onChange={setAccountId} />
            </Field>

            {isEdit && (
                <label className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                    {active ? "Ativa" : "Pausada"}
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#38B2AC] w-4 h-4" />
                </label>
            )}

            {isEdit && (
                <button onClick={remove} disabled={saving} className="text-sm text-red-600 hover:underline">
                    Excluir despesa fixa
                </button>
            )}
        </ModalShell>
    );
}

// --------------------------------------------------------------- pagar conta

export function PayRecurringModal({
    status,
    month,
    accounts,
    defaultAccountId,
    onClose,
    onPaid,
}: {
    status: RecurringStatus;
    month: string;
    accounts: FinanceAccount[];
    defaultAccountId: string | null;
    onClose: () => void;
    onPaid: () => void;
}) {
    const { item } = status;
    const [amount, setAmount] = useState(amountToInput(item.amount));
    const [accountId, setAccountId] = useState<string | null>(item.account_id ?? defaultAccountId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const due = `${String(status.dueDate.getDate()).padStart(2, "0")}/${String(status.dueDate.getMonth() + 1).padStart(2, "0")}`;

    async function pay() {
        const value = parseAmount(amount);
        if (!Number.isFinite(value) || value <= 0) return setError("Informe um valor válido.");

        setSaving(true);
        setError(null);
        try {
            await payRecurring(item, monthStart(month), value, accountId);
            toast.success(`${item.description} marcada como paga!`);
            onPaid();
            onClose();
        } catch (e) {
            setError(financeErrorMessage(e, "Não foi possível registrar o pagamento."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalShell
            title={`Pagar ${item.description}`}
            subtitle={`Vence ${due} · previsto ${formatBRL(item.amount)}`}
            icon={CheckCircle2}
            onClose={onClose}
            error={error}
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton onClick={pay} loading={saving}>
                        Marcar como paga
                    </PrimaryButton>
                </>
            }
        >
            <Field label="Valor pago" hint={`Vira uma saída em “${item.category}” na data de hoje.`}>
                <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" autoFocus />
            </Field>
            <Field label="Pago de qual conta">
                <AccountSelect accounts={accounts} value={accountId} onChange={setAccountId} />
            </Field>
        </ModalShell>
    );
}
