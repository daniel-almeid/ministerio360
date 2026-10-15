
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import AdminTable from "../components/adminTable";
import EditPlanModal from "../components/editPlanModal";
import { ADMIN_ID, useAdmin } from "../hook/useAdminPlans";
import { CustomSelect } from "@/components/shared/customSelect";

export default function AdminPage() {
    const [checking, setChecking] = useState(true);
    const [enabled, setEnabled] = useState(false);

    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        let mounted = true;

        async function check() {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (mounted) {
                    setEnabled(data.session?.user?.id === ADMIN_ID);
                }
            } catch (err) {
                console.error("Admin: erro ao verificar acesso", err);

                if (mounted) {
                    setEnabled(false);
                }
            } finally {
                if (mounted) {
                    setChecking(false);
                }
            }
        }

        void check();

        return () => {
            mounted = false;
        };
    }, []);

    const {
        users,
        loading,
        loaded,
        error,
        selectedUser,
        modalOpen,
        openModal,
        closeModal,
        saveChanges,
        saving,
        refresh,
    } = useAdmin(enabled);

    const filteredUsers = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return users
            .filter((user) => {
                if (!searchTerm) return true;

                return (
                    user.email?.toLowerCase().includes(searchTerm) ||
                    user.church_name?.toLowerCase().includes(searchTerm)
                );
            })
            .filter(
                (user) =>
                    planFilter === "all" ||
                    user.plan_slug === planFilter
            )
            .filter((user) => {
                if (statusFilter === "all") return true;

                return statusFilter === "active"
                    ? user.subscription_active
                    : !user.subscription_active;
            });
    }, [users, search, planFilter, statusFilter]);

    if (checking) {
        return (
            <div className="flex min-h-40 items-center justify-center p-6">
                <p className="text-sm text-gray-500">
                    Verificando acesso...
                </p>
            </div>
        );
    }

    if (!enabled) {
        return (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-6">
                <h2 className="text-lg font-bold text-gray-800">
                    Acesso restrito
                </h2>
                <p className="text-sm text-center text-gray-500">
                    Esta área é exclusiva do administrador do Ministério360.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-1">
                Administração
            </h1>

            <p className="text-sm text-gray-500 mb-6">
                Gerencie usuários, igrejas e seus planos.
                {users.length > 0
                    ? ` · ${filteredUsers.length} de ${users.length}`
                    : ""}
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
                        onChange={(event) => setSearch(event.target.value)}
                        className="px-3 py-2 border rounded-lg w-full bg-gray-50 focus:bg-white transition"
                    />
                </div>

                <CustomSelect
                    label="Plano"
                    value={
                        planFilter === "all"
                            ? "Todos os planos"
                            : planFilter === "free"
                              ? "Grátis"
                              : planFilter === "standard"
                                ? "Padrão"
                                : "Premium"
                    }
                    onChange={(value) => {
                        const plans: Record<string, string> = {
                            "Todos os planos": "all",
                            "Grátis": "free",
                            "Padrão": "standard",
                            "Premium": "premium",
                        };

                        setPlanFilter(plans[value] ?? "all");
                    }}
                    options={[
                        "Todos os planos",
                        "Grátis",
                        "Padrão",
                        "Premium",
                    ]}
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
                    onChange={(value) => {
                        const statuses: Record<string, string> = {
                            "Todas": "all",
                            "Ativa": "active",
                            "Inativa": "inactive",
                        };

                        setStatusFilter(statuses[value] ?? "all");
                    }}
                    options={["Todas", "Ativa", "Inativa"]}
                />
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <h2 className="text-sm font-bold text-red-700">
                        Não foi possível carregar os usuários
                    </h2>

                    <p className="mt-1 text-sm text-red-800">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => void refresh()}
                        disabled={loading}
                        className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Carregando..." : "Tentar de novo"}
                    </button>
                </div>
            )}

            {loaded && !loading && !error && users.length === 0 ? (
                <p className="mt-6 text-center text-sm text-gray-400">
                    Nenhum usuário cadastrado.
                </p>
            ) : loaded && !loading && !error && filteredUsers.length === 0 ? (
                <p className="mt-6 text-center text-sm text-gray-400">
                    Nenhum usuário encontrado com esses filtros.
                </p>
            ) : (
                <AdminTable
                    users={filteredUsers}
                    loading={loading}
                    onEdit={openModal}
                />
            )}

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
