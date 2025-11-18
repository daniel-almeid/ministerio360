"use client";

import { useEffect, useState } from "react";
import { SidebarDesktop } from "./sidebarDesktop";
import { SidebarMobile } from "./sidebarMobile";
import { ChevronRight } from "lucide-react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed") === "true";
    setIsCollapsed(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <>
      <SidebarDesktop
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <SidebarMobile
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {!isMobileOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-[#1E3A5F] text-white p-2 rounded-lg shadow-lg"
          onClick={() => setIsMobileOpen(true)}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
