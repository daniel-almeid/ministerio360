"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { X, Home, Users, Calendar, DollarSign, BarChart3, Settings, UserPlus, Church } from "lucide-react";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home, plan: "free" },
    { href: "/financas", label: "Finanças", icon: DollarSign, plan: "free" },
    { href: "/ministries", label: "Ministérios", icon: Church, plan: "premium" },
    { href: "/membros", label: "Membros", icon: Users, plan: "free" },
    { href: "/visitantes", label: "Visitantes", icon: UserPlus, plan: "standard" },
    { href: "/agenda", label: "Agenda & Escalas", icon: Calendar, plan: "premium" },
    { href: "/relatorios", label: "Relatórios", icon: BarChart3, plan: "standard" },
    { href: "/configuracoes", label: "Configurações", icon: Settings, plan: "free" },
];

export function SidebarMobile({
    isMobileOpen,
    setIsMobileOpen,
    handleProtectedClick
}: {
    isMobileOpen: boolean;
    setIsMobileOpen: (v: boolean) => void;
    handleProtectedClick: (
        requiredPlan: "free" | "standard" | "premium",
        callback: () => void
    ) => void;
}) {
    const pathname = usePathname();

    return (
        <>
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
            )}

            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: isMobileOpen ? 0 : -300 }}
                transition={{ duration: 0.35 }}
                className="fixed top-0 left-0 h-screen w-64 bg-[#1E3A5F] text-white flex flex-col shadow-xl z-50 md:hidden"
            >
                <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
                    <h1 className="text-xl font-bold">Ministério360</h1>

                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 rounded-full bg-white/10"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 mt-3">
                    {links.map(({ href, label, icon: Icon, plan }) => {
                        const isActive = pathname === href;

                        return (
                            <button
                                key={href}
                                onClick={() =>
                                    handleProtectedClick(
                                        plan as "free" | "standard" | "premium",
                                        () => {
                                            setIsMobileOpen(false);
                                            window.location.href = href;
                                        }
                                    )
                                }
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all 
                                    ${isActive
                                        ? "bg-[#38B2AC] text-white shadow-md"
                                        : "hover:bg-[#2C5282] text-[#81E6D9]"
                                    }
                                `}
                            >
                                <Icon size={22} />
                                <span className="font-medium text-[15px]">{label}</span>
                            </button>
                        );
                    })}
                </nav>
            </motion.aside>
        </>
    );
}
