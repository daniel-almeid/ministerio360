import type { Metadata } from "next";
import { AcceptInvite } from "./acceptInvite";

// Página pública (sem login): quem foi convidado cria a conta e entra na igreja
export const metadata: Metadata = {
    title: "Convite · Ministério360",
    robots: { index: false, follow: false },
};

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <AcceptInvite token={token} />;
}
