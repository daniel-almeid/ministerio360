"use client";

import type { ReactNode } from "react";
import { AlertCircle, Loader2, X, type LucideIcon } from "lucide-react";

export const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:bg-white focus:ring-2 focus:ring-[#38B2AC] focus:outline-none";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
    );
}

type ShellProps = {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    error?: string | null;
    wide?: boolean;
};

// Casca dos modais de Finanças (mesmo visual dos modais do sistema)
export function ModalShell({ title, subtitle, icon: Icon, onClose, children, footer, error, wide }: ShellProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div
                className={`bg-white w-full ${wide ? "max-w-lg" : "max-w-md"} rounded-2xl shadow-xl max-h-[90vh] flex flex-col animate-fadeIn`}
            >
                <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#E6FFFA] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#38B2AC]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-800 truncate">{title}</h2>
                        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                        aria-label="Fechar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 overflow-y-auto custom-scrollbar space-y-4 pb-1">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    {children}
                </div>

                {footer && <div className="px-6 pb-5 pt-5 flex justify-end gap-3">{footer}</div>}
            </div>
        </div>
    );
}

export function SecondaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 inline-flex items-center gap-2"
        >
            {children}
        </button>
    );
}

export function PrimaryButton({
    children,
    onClick,
    loading,
    disabled,
}: {
    children: ReactNode;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] disabled:opacity-50 inline-flex items-center gap-2"
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
