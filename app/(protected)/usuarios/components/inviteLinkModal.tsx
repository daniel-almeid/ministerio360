"use client";

import { useState } from "react";
import { Check, Copy, Link2, MessageCircle } from "lucide-react";
import { ModalShell, PrimaryButton } from "../../financas/components/finance/ui";

// Depois de criar (ou ao reenviar) um convite: copiar o link ou mandar pelo WhatsApp
export function InviteLinkModal({
    link,
    message,
    who,
    onClose,
}: {
    link: string;
    message: string;
    who: string; // "Maria" / "Tesoureiro"
    onClose: () => void;
}) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    function whatsapp() {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    }

    return (
        <ModalShell
            title="Convite pronto"
            subtitle={`Envie o link para ${who}`}
            icon={Link2}
            onClose={onClose}
            footer={<PrimaryButton onClick={onClose}>Concluir</PrimaryButton>}
        >
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm text-gray-700 break-all select-all">
                {link}
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
                <button
                    onClick={whatsapp}
                    className="h-11 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold inline-flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                </button>
                <button
                    onClick={copy}
                    className="h-11 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center justify-center gap-2"
                >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    {copied ? "Link copiado" : "Copiar link"}
                </button>
            </div>

            <p className="text-xs text-gray-500">
                O link vale por 7 dias e pode ser usado uma vez. A pessoa cria a própria senha e depois entra no site ou no
                app com o e-mail dela.
            </p>
        </ModalShell>
    );
}
