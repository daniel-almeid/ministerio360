import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import LandingPage from "@/components/landing/landingPage";
import { fetchTestimonials } from "@/lib/testimonials";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Ministério360 · Gestão para igrejas",
    description:
        "Membros, visitantes, finanças com recibos, escalas com confirmação pelo WhatsApp e agenda. No celular e no computador. Comece grátis.",
};

// Os depoimentos são lidos de novo a cada hora
export const revalidate = 3600;

export default async function HomePage() {
    const testimonials = await fetchTestimonials();
    return (
        <div className={poppins.variable}>
            <LandingPage testimonials={testimonials} />
        </div>
    );
}
