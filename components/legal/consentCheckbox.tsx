"use client";

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    invalid?: boolean;
};

// "Li e aceito os Termos de Uso e a Política de Privacidade" (obrigatório no cadastro)
export default function ConsentCheckbox({ checked, onChange, invalid }: Props) {
    return (
        <label
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer select-none transition-colors ${
                invalid ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-teal-600"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
                Li e aceito os{" "}
                <a href="/termos" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline">
                    Termos de Uso
                </a>{" "}
                e a{" "}
                <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline">
                    Política de Privacidade
                </a>{" "}
                do Ministério360.
            </span>
        </label>
    );
}
