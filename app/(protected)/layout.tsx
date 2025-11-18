'use client';

import "../../app/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { Sidebar } from "../../components/shared/sidebar/sidebar";
import { Header } from "../../components/shared/header/header";
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
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        indexedDB.deleteDatabase("supabase-auth");
        indexedDB.deleteDatabase("Supabase");
        router.push("/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div
      className={`
        ${poppins.variable}
        bg-[#F7FAFC] text-gray-800 font-sans
        min-h-screen
        flex flex-col md:flex-row
      `}
    >

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-4 md:p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
