// Peças de texto dos guias (títulos, parágrafos, listas, destaques)

export function Lead({ children }: { children: React.ReactNode }) {
    return <p className="mt-5 text-lg leading-relaxed text-[#33414F]">{children}</p>;
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-[#13324F]">
            {children}
        </h2>
    );
}

export function H3({ children }: { children: React.ReactNode }) {
    return <h3 className="mt-8 text-lg font-semibold text-[#13324F]">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
    return <p className="mt-4 leading-relaxed text-[#33414F]">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
    return <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-[#33414F] marker:text-[#0F766E]">{children}</ul>;
}

export function OL({ children }: { children: React.ReactNode }) {
    return <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-[#33414F] marker:font-semibold marker:text-[#0F766E]">{children}</ol>;
}

export function Note({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <aside className="mt-6 rounded-2xl border border-[#CFEBE6] bg-white p-5">
            <p className="font-semibold text-[#13324F]">{title}</p>
            <div className="mt-1 leading-relaxed text-[#33414F]">{children}</div>
        </aside>
    );
}

export function Toc({ items }: { items: { id: string; label: string }[] }) {
    return (
        <nav aria-label="Neste guia" className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#DCEBE8]">
            <p className="text-sm font-semibold text-[#13324F]">Neste guia</p>
            <ol className="mt-2 space-y-1 text-[15px]">
                {items.map((it, i) => (
                    <li key={it.id}>
                        <a href={`#${it.id}`} className="text-[#0F766E] hover:underline">
                            {i + 1}. {it.label}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
