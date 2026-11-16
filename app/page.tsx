import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import LandingPage from "@/components/landing/landingPage";
import { fetchTestimonials } from "@/lib/testimonials";
import JsonLd from "@/components/recursos/jsonLd";
import { SITE_URL } from "@/lib/seo";
import { PLAY_STORE_URL } from "@/lib/site";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
    display: "swap",
});

export const metadata: Metadata = {
    title: { absolute: "Ministério360 · Sistema de gestão para igrejas" },
    description:
        "Sistema de gestão para igrejas: membros, visitantes, dízimos e ofertas com recibo, escalas com confirmação pelo WhatsApp, agenda e Ministério Infantil. No celular e no computador. Comece grátis.",
    alternates: { canonical: "/" },
};

// Para o Google entender que o site é de um aplicativo (e mostrar preço, sistema etc.)
const APP_LD = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Ministério360",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Android, Web",
    url: SITE_URL,
    description: "Sistema de gestão para igrejas: membros, visitantes, finanças, escalas, agenda e Ministério Infantil.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", description: "Plano Grátis" },
    ...(PLAY_STORE_URL ? { downloadUrl: PLAY_STORE_URL } : {}),
    publisher: { "@type": "Organization", name: "Ministério360", url: SITE_URL, logo: `${SITE_URL}/logo360-cor.png` },
};

// Os depoimentos são lidos de novo a cada hora
export const revalidate = 3600;

export default async function HomePage() {
    const testimonials = await fetchTestimonials();
    return (
        <div className={poppins.variable}>
            <JsonLd data={APP_LD} />
            <LandingPage testimonials={testimonials} />
        </div>
    );
}
