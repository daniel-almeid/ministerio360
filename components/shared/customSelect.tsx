"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function CustomSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handler(e: any) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center px-3 py-2 bg-gray-50 border rounded-lg shadow-sm hover:bg-gray-100 transition text-gray-700"
            >
                {value || "Selecione"}
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 z-50 max-h-56 overflow-auto animate-fadeIn">
                    {options.map((opt) => (
                        <div
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            className={`px-4 py-2 cursor-pointer text-gray-700 hover:bg-[#E6FFFA] hover:text-[#2C7A7B] transition ${value === opt ? "bg-[#EDFDFD] text-[#2C7A7B]" : ""
                                }`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
