"use client";

import "../../app/globals.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { Sidebar } from "../../components/shared/sidebar/sidebar";
import { Header } from "../../components/shared/header/header";
import { supabase } from "../../lib/supabaseClient";
import { identifyChurch } from "../../lib/analytics";
import { AccessGate } from "../../components/shared/access/accessGate";

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

      // Membro e líder de célula usam só o aplicativo: a área web é da equipe
      const { data: access } = await supabase.rpc("my_access");
      if (access?.role === "membro" || access?.role === "lider_celula") {
        router.replace("/abrir-app");
        return;
      }

      // Estatística: liga os eventos à igreja (só o código interno)
      identifyChurch(churchId, plan, active);

      // 👉 Nunca bloquear qualquer rota dentro de `/planos`
      if (pathname.startsWith("/planos")) {
        setLoading(false);
        return;
      }

      // Se plano é pago mas assinatura ainda não foi ativada
      if (plan !== "free" && active === false) {
        router.push("/planos?pagar=1");
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

  // As telas ficam do tamanho da janela, ao lado do menu: quem rola é só a área do
  // conteúdo (e as tabelas, para o lado). A página nunca passa do menu nem da tela.
  return (
    <div
      className={`
        ${poppins.variable}
        bg-[#F7FAFC] text-gray-800 font-sans
        h-dvh overflow-hidden
        flex flex-col md:flex-row
      `}
    >
      <Sidebar />

      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <Header />
        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {/* Cada página só aparece para quem tem acesso a ela */}
          <AccessGate>{children}</AccessGate>
        </main>
      </div>
    </div>
  );
}
