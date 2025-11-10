'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { X, Loader2 } from 'lucide-react';

export default function ModalEditMinistry({ onClose, onSuccess, ministry }: any) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(ministry.name);
        setDescription(ministry.description || '');
    }, [ministry]);

    async function handleUpdate() {
        if (!name.trim()) return alert('O nome é obrigatório.');
        setSaving(true);

        const { error } = await supabase
            .from('ministries')
            .update({ name, description })
            .eq('id', ministry.id);

        setSaving(false);
        if (error) return alert('Erro ao atualizar ministério.');
        onSuccess();
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                </button>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Editar Ministério</h3>

                <div className="space-y-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-emerald-500"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-emerald-500 resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Salvar alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
