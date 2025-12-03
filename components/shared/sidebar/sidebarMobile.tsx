"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
    X,
    Home,
    Users,
    Calendar,
    DollarSign,
    BarChart3,
    Settings,
    UserPlus,
    Church,
    Shield,
    Loader2
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

export function SidebarMobile({
    isMobileOpen,
    setIsMobileOpen,
    handleProtectedClick,
    userId
}: {
    isMobileOpen: boolean;
    setIsMobileOpen: (v: boolean) => void;
    handleProtectedClick: (
        requiredPlan: "free" | "standard" | "premium",
        cb: () => void
    ) => void;
    userId: string | null;
}) {

    const pathname = usePathname();
    const isAdmin = userId === ADMIN_ID;

    const [loading, setLoading] = useState(false);

    const navigateWithLoading = (href: string) => {
        setLoading(true);
        setIsMobileOpen(false);
        setTimeout(() => {
            window.location.href = href;
        }, 150);
    };

    return (
        <>
            {/* Overlay Loading */}
            {loading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="animate-spin text-[#38B2AC] w-10 h-10" />
                        <p className="text-gray-700 font-medium animate-pulse">Carregando...</p>
                    </div>
                </div>
            )}

            {/* OUTER BACKDROP */}
            {isMobileOpen && (
                <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/40 z-40" />
            )}

            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: isMobileOpen ? 0 : -300 }}
                transition={{ duration: 0.35 }}
                className="fixed top-0 left-0 h-screen w-64 bg-[#1E3A5F] text-white flex flex-col shadow-xl z-50"
            >
                <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
                    <h1 className="text-xl font-bold">Ministério360</h1>
                    <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-full bg-white/10">
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col justify-between mt-3">

                    {/* LINKS */}
                    <div className="space-y-1">
                        {links.map(({ href, label, icon: Icon, plan }) => {
                            const isActive = pathname === href;

                            return (
                                <button
                                    key={href}
                                    onClick={() =>
                                        handleProtectedClick(plan as any, () => navigateWithLoading(href))
                                    }
                                    className={`
                                        flex items-center gap-3 w-full 
                                        px-4 py-2.5 rounded-md transition-all overflow-hidden
                                        ${isActive
                                            ? "bg-[#38B2AC] text-white shadow-md"
                                            : "hover:bg-[#2C5282] text-[#81E6D9]"}
                                    `}
                                >
                                    <Icon size={22} />
                                    <span className="font-medium">{label}</span>
                                </button>
                            );
                        })}

                        {isAdmin && (
                            <button
                                onClick={() => navigateWithLoading("/admin/painel")}
                                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-md transition-all hover:bg-[#2C5282] text-[#81E6D9]"
                            >
                                <Shield size={22} />
                                <span className="font-medium">Admin</span>
                            </button>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="px-4 py-4 border-t border-white/10 text-sm text-[#A0AEC0] space-y-3">

                        <span className="block text-center">
                            © {new Date().getFullYear()} Ministério360
                        </span>

                        <div className="flex justify-center gap-6">
                            <button
                                onClick={() => navigateWithLoading("/termos")}
                                className="hover:text-[#38B2AC] transition-colors"
                            >
                                Termos de Uso
                            </button>

                            <button
                                onClick={() => navigateWithLoading("/privacidade")}
                                className="hover:text-[#38B2AC] transition-colors"
                            >
                                Política de Privacidade
                            </button>
                        </div>

                    </div>

                </nav>
            </motion.aside>
        </>
    );
}
