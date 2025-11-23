"use client";

import { useEffect, useState } from "react";
import { SidebarDesktop } from "./sidebarDesktop";
import { SidebarMobile } from "./sidebarMobile";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { UpgradeRequiredModal } from "../../../app/(protected)/planos/components/modal/upgradeRequiredModal";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [userPlan, setUserPlan] = useState<"free" | "standard" | "premium">("free");
  const [modalOpen, setModalOpen] = useState(false);

  // Carrega o plano REAL do JWT (sem usar localStorage)
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed") === "true";
    setIsCollapsed(saved);

    const loadPlan = async () => {
      const { data } = await supabase.auth.getSession();
      const plan = data.session?.user?.app_metadata?.plan_slug;

      if (plan === "free" || plan === "standard" || plan === "premium") {
        setUserPlan(plan);
      }
    };

    loadPlan();
  }, []);

  // Salva o estado do sidebar
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  // Nova lógica de comparação baseada em níveis
  const handleProtectedClick = (
    requiredPlan: "free" | "standard" | "premium",
    callback: () => void
  ) => {
    const level = {
      free: 1,
      standard: 2,
      premium: 3,
    };

    // Se o nível do usuário é >= nível requerido → pode acessar
    if (level[userPlan] >= level[requiredPlan]) {
      callback();
      return;
    }

    // Caso contrário → bloqueia
    setModalOpen(true);
  };

  return (
    <>
      <SidebarDesktop
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        handleProtectedClick={handleProtectedClick}
      />

      <SidebarMobile
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        handleProtectedClick={handleProtectedClick}
      />

      {!isMobileOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-[#1E3A5F] text-white p-2 rounded-lg shadow-lg"
          onClick={() => setIsMobileOpen(true)}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <UpgradeRequiredModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
