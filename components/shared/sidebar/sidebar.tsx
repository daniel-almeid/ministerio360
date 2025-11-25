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
  const [userId, setUserId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed") === "true";
    setIsCollapsed(saved);

    const loadData = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (sessionUser) {
        setUserId(sessionUser.id);

        const plan = sessionUser.app_metadata?.plan_slug;
        if (plan === "free" || plan === "standard" || plan === "premium") {
          setUserPlan(plan);
        }
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  const handleProtectedClick = (
    requiredPlan: "free" | "standard" | "premium",
    callback: () => void
  ) => {
    const level = {
      free: 1,
      standard: 2,
      premium: 3,
    };

    if (level[userPlan] >= level[requiredPlan]) {
      callback();
      return;
    }

    setModalOpen(true);
  };

  return (
    <>
      <SidebarDesktop
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        handleProtectedClick={handleProtectedClick}
        userId={userId}
      />

      <SidebarMobile
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        handleProtectedClick={handleProtectedClick}
        userId={userId}
      />

      {!isMobileOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-[#1E3A5F] text-white p-2 rounded-lg shadow-lg"
          onClick={() => setIsMobileOpen(true)}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <UpgradeRequiredModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
