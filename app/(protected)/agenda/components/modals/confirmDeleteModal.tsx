"use client";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading?: boolean;
    title?: string;
    message?: string;
};

export default function ConfirmDeleteModal({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = "Excluir registro",
    message = "Tem certeza que deseja excluir este item?"
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-gray-600 mt-2">{message}</p>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>

                    <button
                        className="px-4 py-2 rounded-xl bg-red-600 text-white"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Excluindo..." : "Excluir"}
                    </button>
                </div>
            </div>
        </div>
    );
}
