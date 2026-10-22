"use client";

import { Printer } from "lucide-react";

// Imprimir ou salvar o documento em PDF
export default function PrintButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
        >
            <Printer className="w-4 h-4" />
            Imprimir / PDF
        </button>
    );
}
