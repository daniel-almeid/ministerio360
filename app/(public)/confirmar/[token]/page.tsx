import type { Metadata } from "next";
import { ConfirmPresence } from "./confirmPresence";

// Página pública (sem login): o escalado confirma ou recusa a presença
export const metadata: Metadata = {
    title: "Confirmar presença · Ministério360",
    robots: { index: false, follow: false },
};

export default async function ConfirmarPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <ConfirmPresence token={token} />;
}
