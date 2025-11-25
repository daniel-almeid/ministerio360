"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Users,
    Calendar,
    DollarSign,
    BarChart3,
    Settings,
    UserPlus,
    Church,
    Shield
} from "lucide-react";

const ADMIN_ID = "289d49c4-8db0-49e2-b527-af90809f3be8";

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

export function SidebarDesktop({
    isCollapsed,
    setIsCollapsed,
    handleProtectedClick,
    userId
}: {
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    handleProtectedClick: (
        requiredPlan: "free" | "standard" | "premium",
        cb: () => void
    ) => void;
    userId: string | null;
}) {
    const pathname = usePathname();
    const isAdmin = userId === ADMIN_ID;

    return (
        <motion.aside
            initial={false}
            animate={{
                width: isCollapsed ? 100 : 256,
                transition: { duration: 0.5, type: "spring", stiffness: 100, damping: 16 }
            }}
            className="hidden md:flex h-screen bg-[#1E3A5F] text-white flex-col shadow-lg overflow-hidden"
        >
            <div
                className={`relative border-b border-white/10 ${isCollapsed
                        ? "flex flex-col items-center justify-center py-8"
                        : "flex items-center justify-between px-5 py-6"
                    }`}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center ${isCollapsed ? "flex-col" : "gap-3"}`}
                >
                    <Image
                        src="/logo360.png"
                        alt="Logo Ministério360"
                        width={isCollapsed ? 70 : 46}
                        height={isCollapsed ? 70 : 46}
                        className="rounded-lg shadow-md"
                        unoptimized
                    />

                    {!isCollapsed && (
                        <AnimatePresence>
                            <motion.h1
                                key="title"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-2xl font-bold"
                            >
                                Ministério 360
                            </motion.h1>
                        </AnimatePresence>
                    )}
                </motion.div>

                <motion.button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute top-1 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-6 h-6 text-white" />
                    ) : (
                        <ChevronLeft className="w-6 h-6 text-white" />
                    )}
                </motion.button>
            </div>

            <nav className="flex-1 mt-4 space-y-1">
                {links.map(({ href, label, icon: Icon, plan }) => {
                    const isActive = pathname === href;

                    return (
                        <button
                            key={href}
                            onClick={() =>
                                handleProtectedClick(plan as any, () => (window.location.href = href))
                            }
                            className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all
                ${isActive ? "bg-[#38B2AC] text-white" : "hover:bg-[#2C5282] text-[#81E6D9]"}
                ${isCollapsed ? "justify-center" : ""}
              `}
                        >
                            <Icon size={22} />
                            {!isCollapsed && <span className="font-medium">{label}</span>}
                        </button>
                    );
                })}

                {isAdmin && (
                    <button
                        onClick={() => (window.location.href = "/admin/painel")}
                        className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 mt-1 transition-all
              hover:bg-[#2C5282] text-[#81E6D9]
              ${isCollapsed ? "justify-center" : ""}
            `}
                    >
                        <Shield size={22} />
                        {!isCollapsed && <span className="font-medium">Admin</span>}
                    </button>
                )}
            </nav>

            {!isCollapsed && (
                <div className="px-4 py-3 text-sm text-[#A0AEC0] border-t border-white/10">
                    © {new Date().getFullYear()} Ministério360
                </div>
            )}
        </motion.aside>
    );
}
