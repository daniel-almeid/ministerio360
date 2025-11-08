"use client";

type InputProps = {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    type?: string;
};

export function InputField({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    type = "text",
}: InputProps) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
        </div>
    );
}
