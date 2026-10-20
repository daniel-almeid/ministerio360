"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeftRight, Banknote, Briefcase, ChevronRight, CreditCard, Pencil, Plus, Wallet } from "lucide-react";
import {
    createAccount,
    createTransfer,
    deleteAccount,
    financeErrorMessage,
    updateAccount,
} from "../../finance/financeService";
import { amountToInput, formatBRL, parseAmount } from "../../finance/money";
import { ACCOUNT_KIND_LABEL, type AccountKind, type FinanceAccount } from "../../finance/types";
import { AccountSelect } from "./fields";
import { Field, inputClass, ModalShell, PrimaryButton, SecondaryButton } from "./ui";

export const KIND_ICON: Record<AccountKind, typeof Wallet> = {
    caixa: Banknote,
    banco: CreditCard,
    outro: Briefcase,
};

// ------------------------------------------------------------ lista de contas

export function AccountsModal({
    accounts,
    onClose,
    onChanged,
    onTransfer,
}: {
    accounts: FinanceAccount[];
    onClose: () => void;
    onChanged: () => void;
    onTransfer: () => void;
}) {
    const [editing, setEditing] = useState<FinanceAccount | "new" | null>(null);
    const total = accounts.reduce((sum, a) => sum + a.balance, 0);
    const activeCount = accounts.filter((a) => a.is_active).length;

    return (
        <>
            <ModalShell
                title="Contas"
                subtitle={`Saldo total: ${formatBRL(total)}`}
                icon={Wallet}
                onClose={onClose}
                wide
                footer={
                    <>
                        <SecondaryButton onClick={onTransfer} disabled={activeCount < 2}>
                            <ArrowLeftRight className="w-4 h-4" /> Transferir
                        </SecondaryButton>
                        <PrimaryButton onClick={() => setEditing("new")}>
                            <Plus className="w-4 h-4" /> Nova conta
                        </PrimaryButton>
                    </>
                }
            >
                <div className="divide-y divide-gray-100">
                    {accounts.map((a) => {
                        const Icon = KIND_ICON[a.kind];
                        return (
                            <button
                                key={a.id}
                                onClick={() => setEditing(a)}
                                className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 rounded-lg px-1"
                            >
                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                        a.is_active ? "bg-[#E6FFFA] text-[#0F766E]" : "bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium truncate ${a.is_active ? "text-gray-800" : "text-gray-400"}`}>
                                            {a.name}
                                        </span>
                                        {a.is_default && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E6FFFA] text-[#0F766E]">
                                                Padrão
                                            </span>
                                        )}
                                        {!a.is_active && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                Desativada
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">{ACCOUNT_KIND_LABEL[a.kind]}</span>
                                </div>
                                <span className={`font-semibold ${a.balance < 0 ? "text-red-600" : "text-gray-800"}`}>
                                    {formatBRL(a.balance)}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-500">
                    Transferências (ex.: depositar a oferta do caixa no banco) movem o dinheiro entre contas sem contar
                    como entrada ou saída.
                </p>
            </ModalShell>

            {editing && (
                <AccountFormModal
                    account={editing === "new" ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={onChanged}
                />
            )}
        </>
    );
}

// ------------------------------------------------------- criar / editar conta

export function AccountFormModal({
    account,
    onClose,
    onSaved,
}: {
    account: FinanceAccount | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!account;
    const [name, setName] = useState(account?.name ?? "");
    const [kind, setKind] = useState<AccountKind>(account?.kind ?? "banco");
    const [opening, setOpening] = useState(amountToInput(account?.opening_balance ?? 0));
    const [active, setActive] = useState(account?.is_active ?? true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        if (!name.trim()) return setError("Informe o nome da conta.");
        const openingValue = opening.trim() ? parseAmount(opening) : 0;
        if (!Number.isFinite(openingValue)) return setError("Saldo inicial inválido.");

        setSaving(true);
        setError(null);
        try {
            const input = { name, kind, opening_balance: openingValue, is_active: account?.is_default ? true : active };
            if (account) await updateAccount(account.id, input);
            else await createAccount(input);
            toast.success(isEdit ? "Conta atualizada!" : "Conta criada!");
            onSaved();
            onClose();
        } catch (e) {
            setError(financeErrorMessage(e, "Não foi possível salvar a conta."));
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!account) return;
        setSaving(true);
        setError(null);
        try {
            await deleteAccount(account.id);
            toast.success("Conta excluída!");
            onSaved();
            onClose();
        } catch (e) {
            setError(financeErrorMessage(e, "Não foi possível excluir a conta."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalShell
            title={isEdit ? "Editar conta" : "Nova conta"}
            subtitle={account?.is_default ? "Conta padrão da igreja" : "Ex.: Caixa, Banco do Brasil, Poupança"}
            icon={isEdit ? Pencil : Plus}
            onClose={onClose}
            error={error}
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton onClick={save} loading={saving}>
                        {isEdit ? "Salvar" : "Criar conta"}
                    </PrimaryButton>
                </>
            }
        >
            <Field label="Nome">
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>

            <Field label="Tipo">
                <div className="grid grid-cols-3 gap-2">
                    {(["caixa", "banco", "outro"] as AccountKind[]).map((k) => {
                        const Icon = KIND_ICON[k];
                        return (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setKind(k)}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm ${
                                    kind === k
                                        ? "border-[#38B2AC] bg-[#E6FFFA] text-[#0F766E] font-semibold"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <Icon className="w-4 h-4" /> {k === "caixa" ? "Caixa" : k === "banco" ? "Banco" : "Outra"}
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Saldo inicial" hint="Quanto havia nesta conta antes de começar a usar o Ministério360.">
                <input className={inputClass} value={opening} onChange={(e) => setOpening(e.target.value)} inputMode="decimal" />
            </Field>

            {isEdit && !account?.is_default && (
                <label className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                    {active ? "Conta ativa" : "Conta desativada"}
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#38B2AC] w-4 h-4" />
                </label>
            )}

            {isEdit && !account?.is_default && (
                <button onClick={remove} disabled={saving} className="text-sm text-red-600 hover:underline">
                    Excluir conta
                </button>
            )}
        </ModalShell>
    );
}

// ------------------------------------------------------------- transferência

function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TransferModal({
    accounts,
    onClose,
    onSaved,
}: {
    accounts: FinanceAccount[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const active = accounts.filter((a) => a.is_active);
    const caixa = active.find((a) => a.kind === "caixa") ?? active[0];
    const banco = active.find((a) => a.kind === "banco" && a.id !== caixa?.id) ?? active.find((a) => a.id !== caixa?.id);

    const [from, setFrom] = useState<string | null>(caixa?.id ?? null);
    const [to, setTo] = useState<string | null>(banco?.id ?? null);
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(todayISO());
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        const value = parseAmount(amount);
        if (!from || !to) return setError("Escolha as duas contas.");
        if (from === to) return setError("Escolha contas diferentes.");
        if (!Number.isFinite(value) || value <= 0) return setError("Informe um valor válido.");
        if (!date) return setError("Informe a data.");

        setSaving(true);
        setError(null);
        try {
            await createTransfer({ from_account_id: from, to_account_id: to, amount: value, transfer_date: date, note });
            toast.success("Transferência registrada!");
            onSaved();
            onClose();
        } catch (e) {
            setError(financeErrorMessage(e, "Não foi possível registrar a transferência."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalShell
            title="Transferir entre contas"
            subtitle="Não conta como entrada nem saída"
            icon={ArrowLeftRight}
            onClose={onClose}
            error={error}
            footer={
                <>
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton onClick={save} loading={saving}>
                        Transferir
                    </PrimaryButton>
                </>
            }
        >
            <Field label="Sai de">
                <AccountSelect
                    accounts={accounts}
                    value={from}
                    onChange={(id) => {
                        setFrom(id);
                        if (id === to) setTo(null);
                    }}
                />
            </Field>
            <Field label="Entra em">
                <AccountSelect accounts={accounts} value={to} onChange={setTo} excludeId={from} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Valor">
                    <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" />
                </Field>
                <Field label="Data">
                    <input type="date" className={inputClass} value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
                </Field>
            </div>
            <Field label="Observação (opcional)">
                <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
        </ModalShell>
    );
}
