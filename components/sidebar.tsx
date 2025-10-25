"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  UserPlus,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/financas", label: "Finanças", icon: DollarSign },
  { href: "/membros", label: "Membros", icon: Users },
  { href: "/visitantes", label: "Visitantes", icon: UserPlus },
  { href: "/agenda", label: "Agenda & Escalas", icon: Calendar },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/config", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1E3A5F] text-white flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-8">Ministério 360</h1>

      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${
                  isActive
                    ? "bg-[#38B2AC] text-white shadow-md"
                    : "hover:bg-[#2C5282] text-[#81E6D9]"
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

