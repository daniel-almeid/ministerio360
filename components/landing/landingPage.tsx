import Image from "next/image";
import Link from "next/link";
import {
    BarChart3,
    CalendarDays,
    HandCoins,
    HeartHandshake,
    Shield,
    Smartphone,
    UserPlus,
    Users,
    UsersRound,
} from "lucide-react";
import PhoneMock from "./phoneMock";
import PlansSection from "./plansSection";
import SessionRedirect from "./sessionRedirect";
import ReferralCapture from "./referralCapture";
import { PLAY_STORE_URL, SUPPORT_EMAIL } from "@/lib/site";
import type { Testimonial } from "@/lib/testimonials";

// A semana de uma igreja: é uma sequência de verdade, por isso vira linha do tempo
const WEEK = [
    {
        day: "Domingo",
        title: "Escala confirmada",
        text: "Cada voluntário recebe a escala no WhatsApp e confirma presença com um toque. Você vê quem vai e quem não pode.",
    },
    {
        day: "Segunda",
        title: "Dízimos e ofertas lançados",
        text: "A tesouraria registra as entradas do culto e envia o recibo em PDF para o membro, também pelo WhatsApp.",
    },
    {
        day: "Terça",
        title: "Visitante bem recebido",
        text: "Quem visitou no domingo recebe uma mensagem de boas-vindas com o nome da igreja, e o acompanhamento fica anotado.",
    },
    {
        day: "Sexta",
        title: "Lembrete para quem falta",
        text: "Na véspera, o líder é avisado de quem ainda não confirmou a escala e manda um lembrete em segundos.",
    },
    {
        day: "Fim do mês",
        title: "Relatório pronto",
        text: "Entradas, saídas, saldo das contas e crescimento de membros, prontos para a reunião do conselho.",
    },
];

const FEATURES = [
    { icon: Users, title: "Membros", text: "Cadastro completo, aniversariantes e importação da sua planilha." },
    { icon: UserPlus, title: "Visitantes", text: "Quem veio, quando veio e quem já foi acompanhado." },
    { icon: HandCoins, title: "Finanças", text: "Entradas, saídas, contas, contas fixas do mês e recibos." },
    { icon: CalendarDays, title: "Agenda e escalas", text: "Eventos da igreja e escalas por ministério, com confirmação." },
    { icon: HeartHandshake, title: "Ministérios", text: "Louvor, mídia, recepção, infantil: cada um com seus voluntários." },
    { icon: UsersRound, title: "Equipe com permissões", text: "Tesoureiro vê as finanças, secretaria vê os membros, líder vê o ministério dele." },
    { icon: BarChart3, title: "Relatórios", text: "Financeiro e de membros, em PDF, para prestar contas." },
    {
        icon: Smartphone,
        title: "No celular e no computador",
        text: PLAY_STORE_URL
            ? "Aplicativo Android e site, com os mesmos dados."
            : "Pelo navegador do celular ou do computador. O aplicativo para Android chega em breve.",
    },
];

const FAQ = [
    {
        q: "Preciso de cartão para começar?",
        a: "Não. O plano Grátis não pede cartão e não tem prazo para acabar. Você só informa um cartão se decidir assinar um plano pago.",
    },
    {
        q: "Os dados da igreja ficam seguros?",
        a: "Sim. Cada igreja só enxerga os próprios dados, o acesso é feito com senha e cada pessoa da equipe vê apenas as telas que o pastor liberar. Os detalhes estão na Política de Privacidade.",
    },
    {
        q: "Posso cancelar quando quiser?",
        a: "Sim. No plano mensal você cancela pela tela Planos e não há multa. O acesso continua até o fim do período já pago.",
    },
    {
        q: "Funciona no celular?",
        a: PLAY_STORE_URL
            ? "Sim. Há um aplicativo para Android e o site funciona no navegador de qualquer celular ou computador, com os mesmos dados."
            : "Sim. O site funciona no navegador de qualquer celular ou computador, e o aplicativo para Android chega em breve à Google Play.",
    },
    {
        q: "Consigo trazer os membros que já tenho numa planilha?",
        a: "Sim. Na tela de membros há a opção de importar uma planilha do Excel ou do Google Planilhas.",
    },
];

function Initials({ name }: { name: string }) {
    const parts = name.trim().split(/\s+/);
    const text = ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
    return (
        <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-[#E3F2EF] text-sm font-semibold text-[#0F766E]">
            {text}
        </span>
    );
}

function Testimonials({ items }: { items: Testimonial[] }) {
    if (!items.length) return null;
    return (
        <section className="py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-[#13324F] sm:text-4xl">Quem já usa</h2>
                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((t) => (
                        <figure key={t.id} className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-[#DCEBE8]">
                            <blockquote className="flex-1 text-[15px] leading-relaxed text-[#33414F]">“{t.quote}”</blockquote>
                            <figcaption className="mt-6 flex items-center gap-3">
                                {t.photo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={t.photo_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                                ) : (
                                    <Initials name={t.author_name} />
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-[#13324F]">
                                        {t.author_name}
                                        {t.author_role ? `, ${t.author_role}` : ""}
                                    </p>
                                    <p className="text-sm text-[#5B6B7B]">{[t.church_name, t.city].filter(Boolean).join(", ")}</p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

const btnPrimary =
    "inline-flex h-12 items-center justify-center rounded-full bg-[#F4B942] px-6 text-[15px] font-semibold text-[#13324F] transition-colors hover:bg-[#F7C968] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const btnGhost =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white ring-1 ring-white/35 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function LandingPage({ testimonials }: { testimonials: Testimonial[] }) {
    return (
        <div className="min-h-screen bg-white font-sans text-[#1B2430] antialiased">
            <SessionRedirect />
            <ReferralCapture />

            {/* Topo */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#13324F]/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-white">
                        <Image src="/logo360.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" priority />
                        <span className="hidden text-lg font-semibold text-white min-[370px]:inline">Ministério360</span>
                    </Link>
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <a href="#planos" className="hidden rounded-full px-3 py-2 text-sm font-medium text-white/80 hover:text-white sm:inline-block">
                            Planos
                        </a>
                        <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-white/90 hover:text-white focus-visible:outline-2 focus-visible:outline-white">
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#13324F] hover:bg-[#E3F2EF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Criar conta
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                {/* Abertura */}
                <section className="overflow-hidden bg-[#13324F] text-white">
                    <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20">
                        <div>
                            <h1 className="text-[2.35rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                                Do culto de domingo à tesouraria de segunda, a igreja num só lugar.
                            </h1>
                            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
                                Membros, visitantes, finanças, escalas e agenda, feitos para a rotina de uma igreja brasileira.
                                No celular e no computador.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link href="/register" className={btnPrimary}>
                                    Criar conta grátis
                                </Link>
                                {PLAY_STORE_URL && (
                                    <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                                        <Smartphone aria-hidden="true" className="h-5 w-5" />
                                        Baixar na Google Play
                                    </a>
                                )}
                            </div>
                            <p className="mt-4 text-sm text-white/60">O plano Grátis não pede cartão.</p>
                        </div>
                        <div className="md:justify-self-end">
                            <PhoneMock />
                        </div>
                    </div>
                </section>

                {/* A semana da igreja */}
                <section className="py-20 sm:py-24">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-[#13324F] sm:text-4xl">
                            Uma semana de igreja com o Ministério360
                        </h2>
                        <p className="mt-3 max-w-2xl text-[#4A5A6A]">
                            Menos planilha, menos mensagem perdida no grupo e menos papel na tesouraria.
                        </p>

                        <ol className="relative mt-12 grid gap-10 md:grid-cols-5 md:gap-6">
                            <span
                                aria-hidden="true"
                                className="absolute bottom-2 left-[7px] top-2 w-px bg-[#CFE3DF] md:bottom-auto md:left-0 md:right-0 md:top-[7px] md:h-px md:w-auto"
                            />
                            {WEEK.map((w) => (
                                <li key={w.day} className="relative pl-8 md:pl-0 md:pt-9">
                                    <span
                                        aria-hidden="true"
                                        className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-[3px] border-white bg-[#0F766E] ring-1 ring-[#0F766E] md:top-0"
                                    />
                                    <p className="text-sm font-semibold text-[#0F766E]">{w.day}</p>
                                    <h3 className="mt-1 text-lg font-semibold leading-snug text-[#13324F]">{w.title}</h3>
                                    <p className="mt-2 text-[15px] leading-relaxed text-[#4A5A6A]">{w.text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Recursos */}
                <section className="border-t border-[#E6EEED] py-20 sm:py-24">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-[#13324F] sm:text-4xl">
                            Tudo o que a secretaria e a tesouraria precisam
                        </h2>
                        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
                            {FEATURES.map(({ icon: Icon, title, text }) => (
                                <div key={title}>
                                    <Icon aria-hidden="true" className="h-6 w-6 text-[#0F766E]" strokeWidth={1.8} />
                                    <h3 className="mt-3 font-semibold text-[#13324F]">{title}</h3>
                                    <p className="mt-1.5 text-[15px] leading-relaxed text-[#4A5A6A]">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <PlansSection />

                <Testimonials items={testimonials} />

                {/* Perguntas */}
                <section className="py-20 sm:py-24">
                    <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight text-[#13324F] sm:text-4xl">Perguntas frequentes</h2>
                            <p className="mt-3 text-[#4A5A6A]">
                                Ficou alguma dúvida? Escreva para{" "}
                                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#0F766E] underline underline-offset-4">
                                    {SUPPORT_EMAIL}
                                </a>
                                .
                            </p>
                        </div>
                        <div className="divide-y divide-[#E6EEED] border-y border-[#E6EEED]">
                            {FAQ.map((f) => (
                                <details key={f.q} className="group py-5">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left font-semibold text-[#13324F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F766E] [&::-webkit-details-marker]:hidden">
                                        {f.q}
                                        <span aria-hidden="true" className="text-xl font-normal text-[#0F766E] transition-transform group-open:rotate-45">
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-[#4A5A6A]">{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Fechamento */}
                <section className="bg-[#0F766E] text-white">
                    <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-semibold tracking-tight">Comece hoje, sem pagar nada</h2>
                            <p className="mt-2 text-white/85">Cadastre a igreja em dois minutos e convide sua equipe quando quiser.</p>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            <Link href="/register" className={btnPrimary}>
                                Criar conta grátis
                            </Link>
                            {PLAY_STORE_URL && (
                                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                                    <Smartphone aria-hidden="true" className="h-5 w-5" />
                                    Baixar na Google Play
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-[#0B2238] text-white/70">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="flex items-center gap-2">
                        <Shield aria-hidden="true" className="h-4 w-4" />
                        Ministério360 · gestão para igrejas
                    </p>
                    <nav className="flex flex-wrap gap-x-6 gap-y-2">
                        <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
                        <Link href="/privacidade" className="hover:text-white">Política de Privacidade</Link>
                        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">Contato</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
