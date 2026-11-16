import Link from "next/link";
import { PLAY_STORE_URL } from "@/lib/site";

// Fim de cada página: "faça isso no app"
export default function AppCta({ title, text }: { title: string; text: string }) {
    return (
        <section className="mt-14 rounded-3xl bg-[#13324F] px-6 py-8 text-white sm:px-10 sm:py-10 print:hidden">
            <p className="text-sm font-medium text-[#9FD9D1]">Faça isso no Ministério360</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-white/80">{text}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                    href="/register"
                    data-ph="recurso_criar_conta"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#F4B942] px-6 text-[15px] font-semibold text-[#13324F] hover:bg-[#F7C968]"
                >
                    Criar conta grátis
                </Link>
                {PLAY_STORE_URL && (
                    <a
                        href={PLAY_STORE_URL}
                        data-ph="recurso_google_play"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-white ring-1 ring-white/35 hover:bg-white/10"
                    >
                        Baixar na Google Play
                    </a>
                )}
            </div>
            <p className="mt-4 text-sm text-white/60">Plano grátis, sem cartão e sem prazo para acabar.</p>
        </section>
    );
}
