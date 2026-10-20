"use client";

import { useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import toast from "react-hot-toast";
import { CustomSelect } from "../../../../../components/shared/customSelect";
import { AccountSelect, MemberPicker } from "../finance/fields";
import { saveRecurring } from "../../finance/financeService";
import { parseAmount } from "../../finance/money";
import { currentYearMonth, monthStart } from "../../finance/recurring";
import type { FinanceAccount, MemberOption } from "../../finance/types";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
  accounts?: FinanceAccount[];
  defaultAccountId?: string | null;
};

export function ModalNewTransaction({ onClose, onSuccess, accounts = [], defaultAccountId = null }: Props) {
  const [type, setType] = useState("Entrada");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [personName, setPersonName] = useState("");
  const [member, setMember] = useState<MemberOption | null>(null);
  const [accountId, setAccountId] = useState<string | null>(defaultAccountId);
  const [repeat, setRepeat] = useState(false);
  const [loading, setLoading] = useState(false);

  const isIncome = type === "Entrada";
  const linkedMember = isIncome ? member : null;
  const today = new Date().getDate();

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
    const finalCategory = category === "Outro..." ? customCategory.trim() : category;

    if (!finalCategory || !amount) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const value = parseAmount(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Informe um valor válido.");
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

      const payload: Record<string, unknown> = {
        type: isIncome ? "entrada" : "saida",
        category: finalCategory,
        amount: value,
        person_name: linkedMember ? linkedMember.name : personName,
        account_id: accountId,
        member_id: linkedMember?.id ?? null,
      };

      // "Repetir todo mês": cria a despesa fixa e já registra o pagamento deste mês
      if (!isIncome && repeat) {
        const month = monthStart(currentYearMonth());
        payload.recurring_id = await saveRecurring({
          description: personName.trim() || finalCategory,
          category: finalCategory,
          amount: value,
          day_of_month: today,
          account_id: accountId,
          start_month: month,
          end_month: null,
          is_active: true,
        });
        payload.recurring_month = month;
      }

      const { error } = await supabase.from("transactions").insert(payload);

      if (error) {
        console.error(error);
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
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}

          {isIncome && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membro
              </label>
              <MemberPicker value={member} onChange={setMember} />
            </div>
          )}

          {!linkedMember && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isIncome ? "Pessoa / Motivo (se não for membro)" : "Pessoa / Motivo"}
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-[#38B2AC]"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-[#38B2AC]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {accounts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conta
                </label>
                <AccountSelect accounts={accounts} value={accountId} onChange={setAccountId} />
              </div>
            )}
          </div>

          {!isIncome && (
            <label className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer">
              {repeat ? `Repetir todo dia ${today} (despesa fixa)` : "Repetir todo mês"}
              <input
                type="checkbox"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
                className="accent-[#38B2AC] w-4 h-4"
              />
            </label>
          )}
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
