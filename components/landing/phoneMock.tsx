// O app de verdade, desenhado em HTML: a tela Início de um domingo comum
export default function PhoneMock() {
    return (
        <div
            aria-hidden="true"
            className="relative mx-auto w-[270px] rounded-[42px] border-[10px] border-[#0B2238] bg-[#F6FAF9] shadow-[0_30px_60px_-20px_rgba(4,20,35,0.6)] sm:w-[300px]"
        >
            <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0B2238]" />
            <div className="px-4 pb-5 pt-9 text-[#1B2430]">
                <p className="text-[11px] text-[#6B7A89]">Domingo, 15 de novembro</p>
                <p className="mt-0.5 text-[17px] font-semibold leading-tight text-[#13324F]">Olá, Igreja Batista Esperança</p>

                <div className="mt-4 rounded-2xl border border-[#DCEBE8] bg-white p-3">
                    <div className="flex items-baseline justify-between">
                        <p className="text-[13px] font-semibold">Culto da noite</p>
                        <p className="text-[11px] text-[#6B7A89]">19h</p>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#6B7A89]">Louvor, Mídia e Recepção</p>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E3F2EF]">
                        <div className="h-full w-[80%] rounded-full bg-[#0F766E]" />
                    </div>
                    <p className="mt-1.5 text-[11px] font-medium text-[#0F766E]">8 de 10 escalados confirmaram</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-[#13324F] p-3 text-white">
                        <p className="text-[10px] text-white/70">Entradas do mês</p>
                        <p className="mt-0.5 text-[15px] font-semibold">R$ 12.480</p>
                    </div>
                    <div className="rounded-2xl border border-[#DCEBE8] bg-white p-3">
                        <p className="text-[10px] text-[#6B7A89]">Visitantes</p>
                        <p className="mt-0.5 text-[15px] font-semibold text-[#13324F]">6 novos</p>
                    </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#DCEBE8] bg-white p-3">
                    <p className="text-[12px] font-semibold">Aniversariantes da semana</p>
                    <div className="mt-2 flex items-center gap-2">
                        {["AB", "CL", "MS"].map((i) => (
                            <span key={i} className="grid h-7 w-7 place-items-center rounded-full bg-[#E3F2EF] text-[10px] font-semibold text-[#0F766E]">
                                {i}
                            </span>
                        ))}
                        <span className="text-[11px] text-[#6B7A89]">Ana, Carlos e Márcia</span>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#E3F2EF] px-3 py-2.5">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-[11px] font-bold text-white">✓</span>
                    <p className="text-[11px] leading-snug text-[#13324F]">Recibo do dízimo enviado para Ana pelo WhatsApp</p>
                </div>
            </div>
        </div>
    );
}
