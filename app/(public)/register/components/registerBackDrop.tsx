"use client";

import { Loader2 } from "lucide-react";

export default function RegisterBackdrop() {
    return (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="animate-spin text-teal-500 w-10 h-10" />
                <p className="text-gray-700 font-medium">Criando conta...</p>
            </div>
        </div>
    );
}
