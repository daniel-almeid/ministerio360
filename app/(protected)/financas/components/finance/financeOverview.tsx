"use client";

import { useState } from "react";
import { ArrowLeftRight, CheckCircle2, PlusCircle, Settings } from "lucide-react";
import { formatBRL } from "../../finance/money";
import { currentYearMonth } from "../../finance/recurring";
import type { RecurringExpense, RecurringStatus } from "../../finance/types";
import type { FinanceOverview as Overview } from "../../finance/useFinanceOverview";
import { AccountsModal, KIND_ICON, TransferModal } from "./accountModals";
import { PayRecurringModal, RecurringFormModal, RecurringListModal } from "./recurringModals";
import { useMyAccess } from "../../../../../components/shared/access/useMyAccess";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function stateLabel(status: RecurringStatus) {
    const d = status.dueDate;
    const date = `${String(d.getDate()).padStart(2, "0")}/${MONTHS[d.getMonth()]}`;
    switch (status.state) {
        case "paid":
            return { text: `Paga · ${formatBRL(status.payment?.amount ?? 0)}`, cls: "bg-green-50 text-green-700" };
        case "overdue":
            return { text: `Venceu ${date}`, cls: "bg-red-50 text-red-700" };
        case "today":
            return { text: "Vence hoje", cls: "bg-amber-50 text-amber-700" };
        default:
            return { text: `Vence ${date}`, cls: "bg-gray-100 text-gray-600" };
    }
}

// Saldo de cada conta + contas fixas do mês (topo da página de Finanças)
export function FinanceOverview({
    overview,
    selectedMonth,
    onChanged,
}: {
    overview: Overview;
    selectedMonth: string;
    onChanged: () => void;
}) {
    const { can } = useMyAccess();
    const canEdit = can("financas", "edit");
    const [accountsOpen, setAccountsOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [recurringOpen, setRecurringOpen] = useState(false);
    const [recurringForm, setRecurringForm] = useState<RecurringExpense | "new" | null>(null);
    const [paying, setPaying] = useState<RecurringStatus | null>(null);

    const { accounts, activeAccounts, total, statuses, defaultAccount } = overview;
    const pending = statuses.filter((s) => !s.payment);
    const pendingTotal = pending.reduce((sum, s) => sum + s.item.amount, 0);
    const isFutureMonth = selectedMonth > currentYearMonth();

    return (
        <div className="grid gap-4 lg:grid-cols-5 mb-4">
            {/* Saldos (altura fixa no computador; com muitas contas, rola por dentro) */}
            <section className="lg:col-span-3 lg:h-40 flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <h3 className="text-base font-semibold text-gray-700">Saldo atual</h3>
                    <div className="flex items-center gap-3">
                        {activeAccounts.length >= 2 && canEdit && (
                            <button
                                onClick={() => setTransferOpen(true)}
                                className="text-sm font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1"
                            >
                                <ArrowLeftRight className="w-4 h-4" /> Transferir
                            </button>
                        )}
                        {canEdit && <button
                            onClick={() => setAccountsOpen(true)}
                            className="text-sm font-semibold text-[#0F766E] hover:underline inline-flex items-center gap-1"
                        >
                            <Settings className="w-4 h-4" /> Contas
                        </button>}
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        <div className="rounded-xl bg-[#0F766E] text-white px-3 py-2">
                            <p className="text-xs text-teal-100 font-medium">Total</p>
                            <p className="text-base font-bold">{formatBRL(total)}</p>
                        </div>
                        {activeAccounts.map((a) => {
                            const Icon = KIND_ICON[a.kind];
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => canEdit && setAccountsOpen(true)}
                                    className="rounded-xl border border-gray-200 px-3 py-2 text-left hover:bg-gray-50"
                                >
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 truncate">
                                        <Icon className="w-3.5 h-3.5 shrink-0" /> {a.name}
                                    </p>
                                    <p className={`text-base font-bold ${a.balance < 0 ? "text-red-600" : "text-gray-800"}`}>
                                        {formatBRL(a.balance)}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contas do mês (altura fixa; a lista rola por dentro) */}
            <section className="lg:col-span-2 h-44 lg:h-40 flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1 shrink-0">
                    <h3 className="text-base font-semibold text-gray-700">
                        Contas do mês
                        {pending.length > 0 && (
                            <span className="ml-2 text-xs font-medium text-amber-700">
                                {pending.length} a pagar · {formatBRL(pendingTotal)}
                            </span>
                        )}
                    </h3>
                    {canEdit && (<button
                        onClick={() => setRecurringOpen(true)}
                        className="text-sm font-semibold text-[#0F766E] hover:underline"
                    >
                        Gerenciar
                    </button>)}
                </div>

                {statuses.length === 0 ? (
                    <button
                        onClick={() => canEdit && setRecurringForm("new")}
                        className="w-full flex items-center gap-2 text-sm text-gray-500 py-3 hover:text-[#0F766E]"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Cadastre aluguel, energia e outras contas fixas para lembrar todo mês
                    </button>
                ) : (
                    <div className="flex-1 min-h-0 divide-y divide-gray-100 overflow-y-auto custom-scrollbar pr-1">
                        {statuses.map((status) => {
                            const label = stateLabel(status);
                            return (
                                <div key={status.item.id} className="flex items-center gap-2 py-1.5">
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-800 truncate">{status.item.description}</p>
                                        <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${label.cls}`}>
                                            {label.text}
                                        </span>
                                    </div>
                                    {status.payment ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                    ) : (
                                        <>
                                            <span className="text-sm font-semibold text-gray-800 shrink-0">
                                                {formatBRL(status.item.amount)}
                                            </span>
                                            {!isFutureMonth && canEdit && (
                                                <button
                                                    onClick={() => setPaying(status)}
                                                    className="shrink-0 px-2.5 py-1 rounded-lg bg-[#38B2AC] text-white text-xs font-semibold hover:bg-[#319795]"
                                                >
                                                    Pagar
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {accountsOpen && (
                <AccountsModal
                    accounts={accounts}
                    onClose={() => setAccountsOpen(false)}
                    onChanged={onChanged}
                    onTransfer={() => {
                        setAccountsOpen(false);
                        setTransferOpen(true);
                    }}
                />
            )}
            {transferOpen && (
                <TransferModal accounts={accounts} onClose={() => setTransferOpen(false)} onSaved={onChanged} />
            )}
            {recurringOpen && (
                <RecurringListModal
                    items={overview.recurring}
                    accountName={overview.accountName}
                    onClose={() => setRecurringOpen(false)}
                    onNew={() => setRecurringForm("new")}
                    onEdit={(item) => setRecurringForm(item)}
                />
            )}
            {recurringForm && (
                <RecurringFormModal
                    item={recurringForm === "new" ? null : recurringForm}
                    accounts={accounts}
                    defaultAccountId={defaultAccount?.id ?? null}
                    onClose={() => setRecurringForm(null)}
                    onSaved={onChanged}
                />
            )}
            {paying && (
                <PayRecurringModal
                    status={paying}
                    month={selectedMonth}
                    accounts={accounts}
                    defaultAccountId={defaultAccount?.id ?? null}
                    onClose={() => setPaying(null)}
                    onPaid={onChanged}
                />
            )}
        </div>
    );
}
