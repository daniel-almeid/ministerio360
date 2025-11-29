"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  onClose: () => void;
};

export default function PaymentForm({ onClose }: Props) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const sessionRes = await supabase.auth.getSession();
      const jwt = sessionRes.data.session?.access_token;

      if (!jwt) {
        alert("Sessão expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/pagarme/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          plan_slug: "premium",
          number: number.replace(/\s/g, ""),
          holder_name: name,
          exp_month: expMonth,
          exp_year: expYear,
          cvv,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        console.error(result);
        alert(result.error || "Falha ao criar assinatura.");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erro ao processar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Dados do cartão
      </h2>

      <input
        type="text"
        placeholder="Nome impresso no cartão"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded-lg"
      />

      <input
        type="text"
        placeholder="Número do cartão"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        className="w-full border p-2 rounded-lg"
      />

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Mês"
          value={expMonth}
          onChange={(e) => setExpMonth(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Ano"
          value={expYear}
          onChange={(e) => setExpYear(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Processando..." : "Pagar"}
        </button>
      </div>
    </form>
  );
}
