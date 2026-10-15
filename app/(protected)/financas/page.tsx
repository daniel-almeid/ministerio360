"use client";

import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";

import { ModalEditTransaction } from "./components/modals/modalEditTransaction";
import { ModalNewTransaction } from "./components/modals/modalNewTransition";
import { ModalDeleteTransaction } from "./components/modals/modalDeleteTransaction";
import { TransactionTable } from "./components/transactionTable/transactionTable";
import { PaginationControls } from "../../../components/shared/paginationControls";
import { useTransactions } from "./hook/useTransactions";
import { useHeaderData } from "../../../components/shared/header/useHeaderData";
import Loading from "@/components/shared/loading";

export default function FinancasPage() {
  const { churchName } = useHeaderData();

  const {
    transactions,
    paginatedData,
    loading,
    pageChanging,
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
    itemsPerPage,
    exportPdf,
  } = useTransactions();

  const [openModal, setOpenModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-0.5 pb-0.5">
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="text-lg font-semibold text-gray-700">Transações</h3>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer
                         focus:ring-2 focus:ring-[#38B2AC] outline-none"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600
                         focus:ring-2 focus:ring-[#38B2AC] outline-none"
            >
              <option value="todas">Todas</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>

            {/* Exportação de PDF */}
            <button
              onClick={() => exportPdf(churchName)}
              title="Exportar PDF"
              className="relative p-2 rounded-lg border border-teal-400
             bg-white text-[#38B2AC]
             hover:bg-teal-50 transition"
            >
              <FileDown className="w-5 h-5" />

              <span
                className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5
               bg-[#38B2AC] text-white rounded-full"
              >
                PDF
              </span>
            </button>


            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg
                         hover:bg-[#319795] transition-all shadow-sm"
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
            {pageChanging && (
              <div className="md:hidden flex justify-center items-center py-6">
                <Loading />
              </div>
            )}

            <TransactionTable
              data={paginatedData}
              pageChanging={pageChanging}
              onEdit={setEditTransaction}
              onDelete={(id: string) => setConfirmingId(id)}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={transactions.length}
              onNext={handleNext}
              onPrev={handlePrevious}
              itemsPerPage={itemsPerPage}
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
