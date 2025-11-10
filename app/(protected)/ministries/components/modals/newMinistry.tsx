'use client';

import { useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { X, Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

type ModalNewMinistryProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ModalNewMinistry({ onClose, onSuccess }: ModalNewMinistryProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error('O nome do ministério é obrigatório.');
      return;
    }

    setSaving(true);

    const { error, status } = await supabase.from('ministries').insert([
      {
        name: name.trim(),
        description: description.trim() || null,
      },
    ]);

    setSaving(false);

    if (error) {
      console.error('Erro ao salvar ministério:', error.message);

      // 🔹 Tratamento específico para violação de unicidade
      if (
        error.code === '23505' || // violação de unique constraint (Postgres)
        error.message.toLowerCase().includes('duplicate') ||
        error.message.toLowerCase().includes('unique constraint')
      ) {
        toast.error('Erro ao salvar, já existe um ministério com este nome.');
      } else {
        toast.error('Erro ao salvar ministério. Tente novamente.');
      }

      return;
    }

    toast.success(`Ministério "${name}" criado com sucesso!`);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm relative shadow-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <PlusCircle className="w-5 h-5 text-[#38B2AC]" />
          <h3 className="text-lg font-semibold text-gray-700">Novo Ministério</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              placeholder="Digite o nome do ministério"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
              placeholder="Descreva brevemente o propósito do ministério"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
