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
  const [sessionLoaded, setSessionLoaded] = useState(false);

  async function loadTransactions(type = "todas", monthYear = selectedMonth) {
    setLoading(true);

    try {
      // Garante que o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        console.warn("Usuário não autenticado — abortando carregamento.");
        setTransactions([]);
        setLoading(false);
        return;
      }

      console.log("🔑 JWT ativo:", session.user?.app_metadata);

      // Define o intervalo do mês selecionado
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

      if (error) {
        console.error("Erro ao carregar transações:", error);
      } else {
        console.log(`📦 ${data?.length || 0} transações carregadas`);
        setTransactions(data || []);
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error("Erro inesperado ao carregar transações:", err.message);
    }

    setLoading(false);
  }

  // Aguarda restauração da sessão antes de carregar
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.warn("Sessão não encontrada — redirecionar para login?");
      } else {
        console.log("✅ Sessão restaurada:", session.user?.app_metadata);
        setSessionLoaded(true);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (sessionLoaded) loadTransactions(filter, selectedMonth);
  }, [filter, selectedMonth, sessionLoaded]);

  // === Paginação ===
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

  if (!sessionLoaded) {
    return (
      <p className="text-gray-500 text-center mt-10">
        Carregando sessão e dados financeiros...
      </p>
    );
  }

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
                    <tr key={t.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
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
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
                      currentPage === 1
                        ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 border-gray-300 hover:border-[#38B2AC] hover:text-[#38B2AC]"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
                      currentPage === totalPages
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