'use client';
import { useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { X, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';


type ModalDeleteMinistryProps = {
    ministry: any;
    onClose: () => void;
    onDeleted: () => void;
};

export default function ModalDeleteMinistry({ ministry, onClose, onDeleted }: ModalDeleteMinistryProps) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        setDeleting(true);
        const { error, status } = await supabase
            .from('ministries')
            .delete()
            .eq('id', ministry.id);

        setDeleting(false);

        if (error || status === 409) {
            console.error('Erro ao excluir ministério:', error?.message || status);

            if (status === 409 || error?.message?.includes('conflict')) {
                toast.error('Não é possível excluir este ministério, pois há um ou mais membros utilizando.');
            } else {
                toast.error('Erro ao excluir ministério. Tente novamente.');
            }

            return;
        }

        toast.success(`Ministério "${ministry.name}" excluído com sucesso!`);
        onDeleted();
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
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-700">
                        Excluir Ministério
                    </h3>
                </div>

                <p className="text-sm text-gray-600">
                    Deseja realmente excluir o ministério <strong>{ministry.name}</strong>?<br />
                    Essa ação não poderá ser desfeita.
                </p>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}