import Link from "next/link";
import { RESOURCES, resourceUrl } from "@/lib/seo";

// "Veja também": os outros recursos
export default function Related({ current }: { current: string }) {
    const items = RESOURCES.filter((r) => r.slug !== current);
    return (
        <section className="mt-14 print:hidden">
            <h2 className="text-xl font-semibold text-[#13324F]">Veja também</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                    <li key={r.slug}>
                        <Link
                            href={resourceUrl(r.slug)}
                            className="block h-full rounded-2xl bg-white p-5 ring-1 ring-[#DCEBE8] transition hover:ring-[#0F766E]"
                        >
                            <span className="text-xs font-semibold text-[#0F766E]">
                                {r.kind === "ferramenta" ? "Ferramenta grátis" : "Guia"}
                            </span>
                            <span className="mt-1 block font-semibold leading-snug text-[#13324F]">{r.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
