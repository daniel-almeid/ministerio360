"use client";

import { useState } from "react";
import { ModalEditTransaction } from "./components/modals/modalEditTransaction";
import { ModalNewTransaction } from "./components/modals/modalNewTransition";
import { ModalDeleteTransaction } from "./components/modals/modalDeleteTransaction";
import { TransactionTable } from "./components/transactionTable";
import { PaginationControls } from "../../../components/shared/paginationControls";
import { useTransactions } from "./hook/useTransactions";
import Loading from "@/components/shared/loading";

export default function FinancasPage() {
  const {
    transactions,
    paginatedData,
    loading,
    filter,
    setFilter,
    selectedMonth,
    setSelectedMonth,
    totalPages,
    currentPage,
    handleNext,
    handlePrevious,
    confirmDelete,
    loadTransactions,
  } = useTransactions();

  const [openModal, setOpenModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700">Finanças</h2>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-lg font-semibold text-gray-700">Transações</h3>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer focus:ring-2 focus:ring-[#38B2AC] outline-none"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-[#38B2AC] outline-none"
            >
              <option value="todas">Todas</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>

            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
            >
              + Nova Transação
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">
            Nenhuma transação encontrada neste período.
          </p>
        ) : (
          <>
            <TransactionTable
              data={paginatedData}
              onEdit={setEditTransaction}
              onDelete={(id: string) => setConfirmingId(id)}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={transactions.length}
              onNext={handleNext}
              onPrev={handlePrevious}
              itemsPerPage={10}
            />
          </>
        )}
      </section>

      {openModal && (
        <ModalNewTransaction
          onClose={() => setOpenModal(false)}
          onSuccess={() => loadTransactions()}
        />
      )}

      {editTransaction && (
        <ModalEditTransaction
          transaction={editTransaction}
          onClose={() => setEditTransaction(null)}
          onUpdated={() => loadTransactions()}
        />
      )}

      {confirmingId && (
        <ModalDeleteTransaction
          onConfirm={() => confirmDelete(confirmingId)}
          onCancel={() => setConfirmingId(null)}
        />
      )}
    </div>
  );
}
