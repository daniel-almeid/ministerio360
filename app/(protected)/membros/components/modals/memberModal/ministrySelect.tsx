'use client';

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function MinistrySelect({ label = "Ministério", value, onChange, options }: any) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
        value && options.find((m: any) => m.id === value)?.name || "Sem ministério";

    return (
        <div className="relative" ref={ref}>
            <label className="text-sm text-gray-600 mb-1 block">{label}</label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#38B2AC] transition-all ${open ? "ring-2 ring-[#38B2AC]" : ""
                    }`}
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar animate-fadeIn">
                    <div
                        onClick={() => {
                            onChange("");
                            setOpen(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#F0FAF9] ${!value ? "bg-[#E6FFFA] text-[#319795]" : "text-gray-700"
                            }`}
                    >
                        Sem ministério
                    </div>
                    {options.map((m: any) => (
                        <div
                            key={m.id}
                            onClick={() => {
                                onChange(m.id);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#F0FAF9] ${m.id === value
                                    ? "bg-[#E6FFFA] text-[#319795] font-medium"
                                    : "text-gray-700"
                                }`}
                        >
                            {m.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
