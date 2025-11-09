'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import toast from 'react-hot-toast';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function ModalNewMinistry({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('O nome do ministério é obrigatório!');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('ministries')
        .insert([{ name: form.name.trim(), description: form.description || null }]);

      if (error) {
        console.error('Erro ao salvar ministério:', error.message);
        toast.error('Erro ao salvar ministério. Tente novamente.');
        return;
      }

      toast.success('Ministério cadastrado com sucesso!');
      onSuccess();
      onClose();
      setForm({ name: '', description: '' });
    } catch (err: any) {
      console.error('Erro inesperado:', err.message);
      toast.error('Erro inesperado ao salvar ministério.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      {/* Clicar fora fecha o modal */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 z-10 animate-fadeIn">
        <h3 className="text-xl font-semibold text-gray-700">Novo Ministério</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Nome</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#38B2AC] focus:outline-none"
              placeholder="Ex: Louvor, Som, Recepção..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Descrição</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#38B2AC] focus:outline-none"
              placeholder="Descrição (opcional)"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
