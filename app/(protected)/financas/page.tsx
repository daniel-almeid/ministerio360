"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { ModalNovaTransacao } from "./modalNewTransition";
import { ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";

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
  const [sessionLoaded, setSessionLoaded] = useState(false);

  async function loadTransactions(type = "todas", monthYear = selectedMonth) {
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        console.warn("Usuário não autenticado — abortando carregamento.");
        setTransactions([]);
        setLoading(false);
        return;
      }

      const [year, month] = monthYear.split("-");
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

      let query = supabase
        .from("transactions")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false });

      if (type !== "todas") query = query.eq("type", type);

      const { data, error } = await query;
      if (error) console.error("Erro ao carregar transações:", error);
      else setTransactions(data || []);
    } catch (err: any) {
      console.error("Erro inesperado:", err.message);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  }

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setSessionLoaded(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (sessionLoaded) loadTransactions(filter, selectedMonth);
  }, [filter, selectedMonth, sessionLoaded]);

  const totalPages = useMemo(() => Math.ceil(transactions.length / ITEMS_PER_PAGE), [transactions]);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  const handlePrevious = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);

  if (!sessionLoaded) {
    return <p className="text-gray-500 text-center mt-10">Carregando sessão e dados financeiros...</p>;
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

        {loading ? (
          <p className="text-gray-500 text-center py-8 text-sm">Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">Nenhuma transação encontrada neste período.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pessoa / Motivo</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F9FAFB] transition-all duration-200">
                      <td className="px-5 py-4 font-medium flex items-center gap-2 text-[15px]">
                        {t.type === "entrada" ? (
                          <>
                            <ArrowUpCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-700">Entrada</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-700">Saída</span>
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700 capitalize text-[15px]">{t.category}</td>
                      <td className="px-5 py-4 text-[15px] font-semibold">
                        R$ {Number(t.amount).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-5 py-4 text-gray-700 text-[15px] capitalize">{t.note || "-"}</td>
                      <td className="px-5 py-4 flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 text-[#38B2AC]" />
                        {new Date(t.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                  <strong className="text-gray-700">{transactions.length}</strong> transações
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${currentPage === 1
                        ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                      }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${currentPage === totalPages
                        ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                      }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {openModal && (
        <ModalNovaTransacao
          onClose={() => setOpenModal(false)}
          onSuccess={() => loadTransactions(filter, selectedMonth)}
        />
      )}
    </div>
  );
}
