"use client";

type SelectProps = {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    options: string[];
};

export function SelectField({ label, name, value, onChange, options }: SelectProps) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            >
                {options.map((opt) => (
                    <option key={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}
