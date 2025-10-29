import "../../app/globals.css";
import { Poppins } from "next/font/google";
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/header";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Ministério 360",
  description: "Painel de gestão para igrejas",
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${poppins.variable} flex min-h-screen bg-[#F7FAFC] text-gray-800 font-sans`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}


