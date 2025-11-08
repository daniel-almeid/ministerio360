"use client";

type TextareaProps = {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
};

export function TextareaField({ label, name, value, onChange }: TextareaProps) {
    return (
        <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
            <textarea
                name={name}
                rows={2}
                value={value}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
            />
        </div>
    );
}
