"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { supabase } from "../../../../../lib/supabaseClient";

type DeleteMemberModalProps = {
    member: any;
    onClose: () => void;
    onSuccess: () => void;
};

export default function DeleteMemberModal({ member, onClose, onSuccess }: DeleteMemberModalProps) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const { error } = await supabase.from("members").delete().eq("id", member.id);
        setLoading(false);

        if (error) {
            alert("Erro ao excluir membro.");
            console.error(error);
        } else {
            onSuccess();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 p-3 rounded-full mb-4">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Excluir Membro
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Tem certeza que deseja excluir{" "}
                        <strong>{member.name}</strong>? Essa ação não poderá ser desfeita.
                    </p>

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                        >
                            {loading ? "Excluindo..." : "Excluir"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
