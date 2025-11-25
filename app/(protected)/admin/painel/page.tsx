"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import AdminTable from "../components/adminTable";
import EditPlanModal from "../components/editPlanModal";
import { useAdmin } from "../hook/useAdminPlans";
import { CustomSelect } from "@/components/shared/customSelect";

export default function AdminPage() {
    const [enabled, setEnabled] = useState(false);

    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        async function check() {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user?.id === "289d49c4-8db0-49e2-b527-af90809f3be8") {
                setEnabled(true);
            }
        }
        check();
    }, []);

    const {
        users,
        loading,
        selectedUser,
        modalOpen,
        openModal,
        closeModal,
        saveChanges,
        saving,
    } = useAdmin(enabled);

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => {
                if (!search.trim()) return true;

                const s = search.toLowerCase();
                return (
                    u.email?.toLowerCase().includes(s) ||
                    u.church_name?.toLowerCase().includes(s)
                );
            })
            .filter(u => {
                if (planFilter === "all") return true;
                return u.plan_slug === planFilter;
            })
            .filter(u => {
                if (statusFilter === "all") return true;
                if (statusFilter === "active") return u.subscription_active;
                return !u.subscription_active;
            });
    }, [users, search, planFilter, statusFilter]);

    if (!enabled) {
        return (
            <div className="p-6 text-gray-500">
                Acesso restrito.
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-1">Administração</h1>
            <p className="text-sm text-gray-500 mb-6">
                Gerencie usuários, igrejas e seus planos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        Buscar
                    </label>
                    <input
                        type="text"
                        placeholder="Buscar usuário ou igreja..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 border rounded-lg w-full bg-gray-50 focus:bg-white transition"
                    />
                </div>

                <CustomSelect
                    label="Plano"
                    value={
                        planFilter === "all"
                            ? "Todos os planos"
                            : planFilter.charAt(0).toUpperCase() + planFilter.slice(1)
                    }
                    onChange={(v) => {
                        if (v === "Todos os planos") setPlanFilter("all");
                        else setPlanFilter(v.toLowerCase());
                    }}
                    options={["Todos os planos", "free", "standard", "premium"]}
                />

                <CustomSelect
                    label="Assinatura"
                    value={
                        statusFilter === "all"
                            ? "Todas"
                            : statusFilter === "active"
                                ? "Ativa"
                                : "Inativa"
                    }
                    onChange={(v) => {
                        if (v === "Todas") setStatusFilter("all");
                        if (v === "Ativa") setStatusFilter("active");
                        if (v === "Inativa") setStatusFilter("inactive");
                    }}
                    options={["Todas", "Ativa", "Inativa"]}
                />

            </div>

            <AdminTable
                users={filteredUsers}
                loading={loading}
                onEdit={openModal}
            />

            <EditPlanModal
                user={selectedUser}
                open={modalOpen}
                onClose={closeModal}
                onSave={saveChanges}
                saving={saving}
            />
        </div>
    );
}
