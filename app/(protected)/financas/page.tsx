"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { ModalNovaTransacao } from "./modalNewTransition";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 15;

export default function FinancasPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [currentPage, setCurrentPage] = useState(1);

  async function loadTransactions(type = "todas", monthYear = selectedMonth) {
    setLoading(true);

    const [year, month] = monthYear.split("-");
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    let query = supabase
      .from("transactions")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false });

    if (type !== "todas") {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao carregar transações:", error);
    } else {
      setTransactions(data || []);
      setCurrentPage(1);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTransactions(filter, selectedMonth);
  }, [filter, selectedMonth]);

  // === PAGINAÇÃO ===
  const totalPages = useMemo(() => Math.ceil(transactions.length / ITEMS_PER_PAGE), [transactions]);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700">Finanças</h2>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h3 className="font-semibold text-gray-700">Transações</h3>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600"
            >
              <option value="todas">Todas</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>

            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-colors"
            >
              + Nova Transação
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-6">Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            Nenhuma transação encontrada para este período.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-gray-500 border-b text-left">
                    <th className="pb-2 px-3">Tipo</th>
                    <th className="pb-2 px-3">Categoria</th>
                    <th className="pb-2 px-3">Valor</th>
                    <th className="pb-2 px-3">Pessoa/Motivo</th>
                    <th className="pb-2 px-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b last:border-none hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className={`py-2 px-3 capitalize font-medium ${
                          t.type === "entrada" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.type}
                      </td>
                      <td className="py-2 px-3 capitalize">{t.category}</td>
                      <td className="py-2 px-3">
                        R$ {Number(t.amount).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="py-2 px-3 capitalize">{t.note || "-"}</td>
                      <td className="py-2 px-3 text-gray-500">
                        {new Date(t.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* === PAGINAÇÃO MODERNA === */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">
                  Exibindo{" "}
                  <strong className="text-gray-700">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-gray-700">
                    {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}
                  </strong>{" "}
                  de{" "}
                  <strong className="text-gray-700">{transactions.length}</strong>{" "}
                  transações
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
                      currentPage === 1
                        ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                    }`}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Páginas numeradas com elipses */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, i, arr) => (
                        <div key={page}>
                          {i > 0 && arr[i - 1] !== page - 1 && (
                            <span className="text-gray-400 px-1">…</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                              currentPage === page
                                ? "bg-[#38B2AC] text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
                      currentPage === totalPages
                        ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                    }`}
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {openModal && (
        <ModalNovaTransacao
          onClose={() => setOpenModal(false)}
          onSuccess={() => loadTransactions(filter, selectedMonth)}
        />
      )}
    </div>
  );
}
