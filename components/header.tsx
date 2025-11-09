"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Church, LogOut, User } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import toast from "react-hot-toast";

export function Header() {
  const [churchName, setChurchName] = useState<string>("Carregando...");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadChurchData();
  }, []);

  async function loadChurchData() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const church_id = session?.user?.app_metadata?.church_id;
      const email = session?.user?.email || null;
      setUserEmail(email);

      if (!church_id) {
        setChurchName("Igreja não definida");
        return;
      }

      const { data: info, error } = await supabase
        .from("church_institutional_info")
        .select("trade_name")
        .eq("church_id", church_id)
        .limit(1);

      if (!error && info?.[0]?.trade_name) {
        setChurchName(info[0].trade_name);
      } else {
        const { data: profile } = await supabase
          .from("church_profiles")
          .select("name")
          .eq("id", church_id)
          .single();

        setChurchName(profile?.name || "Sem nome");
      }
    } catch (err: any) {
      console.error("Erro ao carregar nome da igreja:", err.message);
      setChurchName("Erro ao carregar");
    }
  }

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
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
      </h2>

      <div className="flex items-center gap-5">
        <span className="text-gray-800 font-medium text-base">
          {churchName}
        </span>

        <Menu as="div" className="relative">
          <Menu.Button
            aria-label="Abrir menu de perfil"
            className="w-11 h-11 rounded-full bg-linear-to-br from-teal-600 to-teal-700 flex items-center justify-center focus:outline-none hover:scale-105 transition-transform shadow-md"
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
              {/* Cabeçalho do menu */}
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

              {/* Opções */}
              <div className="py-2">
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <button
                      onClick={() => router.push("/configuracoes")}
                      className={`${active ? "bg-gray-50" : ""
                        } flex items-center w-full px-5 py-2.5 text-[15px] text-gray-700 gap-2 transition`}
                    >
                      <User size={18} /> Perfil da Igreja
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <button
                      onClick={handleLogout}
                      className={`${active
                          ? "bg-red-50 text-red-600"
                          : "text-red-500 hover:bg-red-50"
                        } flex items-center w-full px-5 py-2.5 text-[15px] gap-2 transition`}
                    >
                      <LogOut size={18} /> Sair
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
