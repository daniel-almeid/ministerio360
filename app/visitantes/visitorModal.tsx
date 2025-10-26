"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Visitor } from "../types/visitors";

interface VisitorModalProps {
  onClose: () => void;
  onSuccess: () => void;
  visitor?: Visitor;
}

export default function VisitorModal({ onClose, onSuccess, visitor }: VisitorModalProps) {
  const isEditing = !!visitor;

  const [formData, setFormData] = useState({
    name: "",
    visit_date: "",
    phone: "",
    email: "",
    notes: "",
    is_member: false,
  });

  useEffect(() => {
    if (visitor) {
      setFormData({
        name: visitor.name || "",
        visit_date: visitor.visit_date ? new Date(visitor.visit_date).toISOString().split("T")[0] : "",
        phone: visitor.phone || "",
        email: visitor.email || "",
        notes: visitor.notes || "",
        is_member: !!visitor.is_member,
      });
    }
  }, [visitor]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      visit_date: formData.visit_date,
      phone: formData.phone || null,
      email: formData.email || null,
      notes: formData.notes || null,
      is_member: formData.is_member,
    };

    let error;
    if (isEditing) {
      const { error: updError } = await supabase
        .from("visitors")
        .update(payload)
        .eq("id", visitor!.id)
        .select()
        .single();
      error = updError;
    } else {
      const { error: insError } = await supabase
        .from("visitors")
        .insert(payload)
        .select()
        .single();
      error = insError;
    }

    if (error) {
      console.error("Erro ao salvar visitante:", error);
      alert("Erro ao salvar visitante.");
      return;
    }

    // *** IMPORTANTE: avisa o pai para recarregar, depois fecha
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {isEditing ? "Editar Visitante" : "Registrar Visitante"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Data da visita</label>
            <input
              type="date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Telefone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_member"
              name="is_member"
              checked={formData.is_member}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label htmlFor="is_member" className="text-sm text-gray-700">
              É membro de alguma igreja?
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Anotações</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]">
              {isEditing ? "Salvar Alterações" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
