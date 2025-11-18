"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    motion,
    AnimatePresence
} from "framer-motion";
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
    Church
} from "lucide-react";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/financas", label: "Finanças", icon: DollarSign },
    { href: "/ministries", label: "Ministérios", icon: Church },
    { href: "/membros", label: "Membros", icon: Users },
    { href: "/visitantes", label: "Visitantes", icon: UserPlus },
    { href: "/agenda", label: "Agenda & Escalas", icon: Calendar },
    { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function SidebarDesktop({
    isCollapsed,
    setIsCollapsed
}: {
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
}) {
    const pathname = usePathname();

    return (
        <motion.aside
            initial={false}
            animate={{
                width: isCollapsed ? 100 : 256,
                transition: {
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                    damping: 16
                }
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
                    key={isCollapsed ? "logo-large" : "logo-normal"}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`flex items-center ${isCollapsed ? "flex-col justify-center" : "gap-3"
                        }`}
                >
                    <motion.div
                        animate={{
                            scale: isCollapsed ? 1.15 : 1,
                            rotate: isCollapsed ? 2 : 0,
                            transition: { duration: 0.5, type: "spring", stiffness: 120 }
                        }}
                    >
                        <Image
                            src="/logo360.png"
                            alt="Logo Ministério360"
                            width={isCollapsed ? 70 : 46}
                            height={isCollapsed ? 70 : 46}
                            priority
                            unoptimized
                            className={`select-none transition-all duration-500 ${isCollapsed
                                ? "rounded-2xl shadow-lg mb-2"
                                : "rounded-lg shadow-md"
                                }`}
                        />
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.h1
                                key="title"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.35, delay: 0.1 }}
                                className="text-2xl font-bold tracking-tight whitespace-nowrap"
                            >
                                Ministério 360
                            </motion.h1>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                        rotate: isCollapsed ? 360 : 0,
                        transition: { duration: 0.4, ease: "easeInOut" }
                    }}
                    className="absolute top-1 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all md:block hidden"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-6 h-6 text-white" />
                    ) : (
                        <ChevronLeft className="w-6 h-6 text-white" />
                    )}
                </motion.button>
            </div>

            <motion.nav
                initial={false}
                animate={{
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                }}
                className="flex-1 mt-4 space-y-1"
            >
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <motion.div
                            key={href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link
                                href={href}
                                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all
                  ${isActive
                                        ? "bg-[#38B2AC] text-white shadow-md"
                                        : "hover:bg-[#2C5282] text-[#81E6D9]"
                                    }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                            >
                                <Icon size={22} />
                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.span
                                            key={label}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{ duration: 0.25 }}
                                            className="font-medium text-[15px] whitespace-nowrap"
                                        >
                                            {label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.nav>

            {!isCollapsed && (
                <motion.div
                    key="footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="px-4 py-3 border-t border-white/10 text-sm text-[#A0AEC0]"
                >
                    <p>© {new Date().getFullYear()} Ministério360</p>
                </motion.div>
            )}
        </motion.aside>
    );
}
