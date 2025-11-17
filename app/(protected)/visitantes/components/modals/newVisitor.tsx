"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { Visitor } from "../../../../types/visitors";
import toast from "react-hot-toast";

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
        visit_date: visitor.visit_date
          ? new Date(visitor.visit_date).toISOString().split("T")[0]
          : "",
        phone: visitor.phone ? visitor.phone.replace(/^55/, "") : "",
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
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.visit_date) {
      toast.error("Preencha o nome e a data da visita!");
      return;
    }

    const rawPhone = formData.phone.replace(/\D/g, "");
    const phoneWithCountry = rawPhone
      ? rawPhone.startsWith("55")
        ? rawPhone
        : `55${rawPhone}`
      : null;

    const payload = {
      name: formData.name.trim(),
      visit_date: formData.visit_date,
      phone: phoneWithCountry,
      email: formData.email || null,
      notes: formData.notes || null,
      is_member: formData.is_member,
    };

    let error;
    try {
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
        toast.error("Erro ao salvar visitante. Tente novamente.");
        return;
      }

      toast.success(
        isEditing
          ? "Visitante atualizado com sucesso!"
          : "Visitante registrado com sucesso!"
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro inesperado:", err.message);
      toast.error("Erro inesperado ao salvar visitante.");
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-fadeIn">
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
              className="w-full border rounded-lg px-3 py-2 focus:ring-[#38B2AC] focus:outline-none"
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
              className="w-full border rounded-lg px-3 py-2 focus:ring-[#38B2AC] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Telefone</label>
            <input
              type="text"
              name="phone"
              placeholder="(DDD) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-[#38B2AC] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-[#38B2AC] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_member"
              name="is_member"
              checked={formData.is_member}
              onChange={handleChange}
              className="w-4 h-4 accent-[#38B2AC]"
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
              className="w-full border rounded-lg px-3 py-2 focus:ring-[#38B2AC] focus:outline-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
            >
              {isEditing ? "Salvar Alterações" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
