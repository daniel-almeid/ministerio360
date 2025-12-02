"use client";

import "../../app/globals.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      // Sem sessão → login
      if (!session) {
        router.push("/login");
        return;
      }

      const churchId = session.user?.app_metadata?.church_id;
      const plan = session.user?.app_metadata?.plan_slug || "free";

      // Com webhook funcionando: assinatura ativa
      const active = session.user?.app_metadata?.subscription_active ?? false;

      // Se churchId não existe → logout total
      if (!churchId) {
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      // 👉 Nunca bloquear qualquer rota dentro de `/planos`
      if (pathname.startsWith("/planos")) {
        setLoading(false);
        return;
      }

      // Se plano é pago mas assinatura ainda não foi ativada
      if (plan !== "free" && active === false) {
        router.push("/planos");
        return;
      }

      setLoading(false);
    };

    validateAccess();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-700">
        Carregando...
      </div>
    );
  }

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
        <main className="p-4 md:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
