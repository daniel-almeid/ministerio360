import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
    display: "swap",
});

// Mesma fonte da página inicial
export default function RecursosLayout({ children }: { children: React.ReactNode }) {
    return <div className={poppins.variable}>{children}</div>;
}
