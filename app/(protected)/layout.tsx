'use client';

import "../../app/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/header";
import { supabase } from "../../lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const churchId = data.session?.user?.app_metadata?.church_id;

      if (!churchId) {
        console.warn("⚠️ Sessão inválida — limpando cache...");
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        indexedDB.deleteDatabase("supabase-auth");
        indexedDB.deleteDatabase("Supabase");
        router.push("/login");
      } else {
        console.log("✅ Sessão válida com church_id:", churchId);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div
      className={`${poppins.variable} flex min-h-screen bg-[#F7FAFC] text-gray-800 font-sans`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}

