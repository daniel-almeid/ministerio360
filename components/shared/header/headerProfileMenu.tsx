"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Church, User, LogOut, CreditCard } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import toast from "react-hot-toast";

export function HeaderProfileMenu({
    churchName,
    userEmail,
}: {
    churchName: string;
    userEmail: string | null;
}) {
    const router = useRouter();

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Erro ao sair. Tente novamente.");
            return;
        }
        toast.success("Logout realizado com sucesso!");
        router.push("/login");
    }

    return (
        <Menu as="div" className="relative">
            <Menu.Button
                aria-label="Abrir menu de perfil"
                className="w-11 h-11 rounded-full bg-linear-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
                <Church className="text-white w-5 h-5" />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right bg-white border border-gray-100 rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none z-50">

                    <div className="px-5 py-4 border-b border-gray-100">
                        <p className="text-[15px] font-semibold text-gray-900">
                            {churchName}
                        </p>
                        {userEmail && (
                            <p className="text-sm text-gray-500 mt-0.5 truncate">
                                {userEmail}
                            </p>
                        )}
                    </div>

                    <div className="py-2">

                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => router.push("/configuracoes")}
                                    className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-5 py-2.5 text-[15px] text-gray-700 gap-2`}
                                >
                                    <User size={18} /> Perfil da Igreja
                                </button>
                            )}
                        </Menu.Item>

                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => router.push("/planos")}
                                    className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-5 py-2.5 text-[15px] text-gray-700 gap-2`}
                                >
                                    <CreditCard size={18} /> Planos
                                </button>
                            )}
                        </Menu.Item>

                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => router.push("/planos/assinatura")}
                                    className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-5 py-2.5 text-[15px] text-gray-700 gap-2`}
                                >
                                    <CreditCard size={18} /> Minha assinatura
                                </button>
                            )}
                        </Menu.Item>

                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    className={`${active ? "bg-red-50 text-red-600" : "text-red-500 hover:bg-red-50"} flex items-center w-full px-5 py-2.5 text-[15px] gap-2`}
                                >
                                    <LogOut size={18} /> Sair
                                </button>
                            )}
                        </Menu.Item>
                    </div>

                </Menu.Items>
            </Transition>
        </Menu>
    );
}
