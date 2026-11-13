import Link from "next/link";
import { StateScreen, stateButton, stateButtonOutline } from "@/components/system/stateScreen";

export const metadata = { title: "Página não encontrada · Ministério360" };

// 404 em português
export default function NotFound() {
    return (
        <StateScreen
            tone="teal"
            art={<span className="text-6xl font-extrabold tracking-tighter text-[#0F766E] lg:text-[120px]">404</span>}
            title="Página não encontrada"
            text="O endereço pode ter sido digitado errado ou a página mudou de lugar."
        >
            <Link href="/" className={stateButton}>
                Ir para o início
            </Link>
            <Link href="/login" className={stateButtonOutline}>
                Entrar na minha conta
            </Link>
        </StateScreen>
    );
}
