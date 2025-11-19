"use client";

import { useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast from "react-hot-toast";
import { CustomSelect } from "../../../../../components/shared/customSelect";

export function ModalNewTransaction({ onClose, onSuccess }: any) {
  const [type, setType] = useState("Entrada");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [personName, setPersonName] = useState("");
  const [loading, setLoading] = useState(false);

  const categoriasPadrao = [
    "Dízimo",
    "Oferta",
    "Compras",
    "Contas",
    "Eventos",
    "Doações",
    "Missões",
    "Outro...",
  ];

  async function handleSave() {
    if (!category || !amount) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const payload = {
        type: type.toLowerCase(),
        category,
        amount: parseFloat(amount),
        person_name: personName,
      };

      const { error } = await supabase.from("transactions").insert(payload);

      if (error) {
        toast.error("Erro ao salvar transação.");
        return;
      }

      toast.success("Transação salva com sucesso!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error("Erro inesperado: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Nova Transação
        </h2>

        <div className="space-y-4">
          <CustomSelect
            label="Tipo"
            value={type}
            onChange={setType}
            options={["Entrada", "Saída"]}
          />

          <CustomSelect
            label="Categoria"
            value={category}
            onChange={setCategory}
            options={categoriasPadrao}
          />

          {category === "Outro..." && (
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-[#38B2AC] focus:outline-none"
              placeholder="Digite a categoria"
              onChange={(e) => setCategory(e.target.value)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pessoa / Motivo
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-[#38B2AC]"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-[#38B2AC]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
