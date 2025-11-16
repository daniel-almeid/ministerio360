type Props = {
    saving: boolean;
    onClose: () => void;
};

export default function SubmitActions({ saving, onClose }: Props) {
    return (
        <div className="flex justify-end gap-3 pt-4 border-t">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg"
            >
                Cancelar
            </button>

            <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg"
            >
                {saving ? "Salvando..." : "Salvar"}
            </button>
        </div>
    );
}
