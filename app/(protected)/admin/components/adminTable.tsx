"use client";

import type { AdminUser } from "../hook/useAdminPlans";

type Props = {
    users: AdminUser[];
    loading: boolean;
    onEdit: (u: AdminUser) => void;
};

export default function AdminTable({ users, loading, onEdit }: Props) {
    if (loading) {
        return <div className="text-sm text-gray-500">Carregando...</div>;
    }

    if (users.length === 0) {
        return <div className="text-sm text-gray-500">Nenhum usuário encontrado.</div>;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">

            {/* DESKTOP TABLE */}
            <table className="hidden md:table min-w-full divide-y divide-gray-100 text-center">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">E-mail</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Igreja</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plano</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assinatura</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Criado usuário</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Criado igreja</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                    {users.map((u) => (
                        <tr key={u.user_id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-sm">{u.email}</td>
                            <td className="px-4 py-3 text-sm">{u.church_name ?? "-"}</td>

                            <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 text-xs rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                                    {u.plan_slug ?? "free"}
                                </span>
                            </td>

                            <td className="px-4 py-3 text-sm">
                                {u.subscription_active ? (
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-100">
                                        Ativa
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-100">
                                        Inativa
                                    </span>
                                )}
                            </td>

                            <td className="px-4 py-3 text-sm">
                                {u.created_at_user
                                    ? new Date(u.created_at_user).toLocaleDateString("pt-BR")
                                    : "-"}
                            </td>

                            <td className="px-4 py-3 text-sm">
                                {u.created_at_church
                                    ? new Date(u.created_at_church).toLocaleDateString("pt-BR")
                                    : "-"}
                            </td>

                            <td className="px-4 py-3">
                                <button
                                    onClick={() => onEdit(u)}
                                    className="px-3 py-1.5 text-xs rounded-full border border-teal-500 text-teal-600 hover:bg-teal-50 transition"
                                >
                                    Alterar plano
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4 p-3">
                {users.map((u) => (
                    <div
                        key={u.user_id}
                        className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
                    >
                        <div className="mb-2">
                            <p className="text-xs text-gray-500">E-mail</p>
                            <p className="text-sm font-medium">{u.email}</p>
                        </div>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500">Igreja</p>
                            <p className="text-sm">{u.church_name ?? "-"}</p>
                        </div>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500">Plano</p>
                            <span className="px-2 py-1 text-xs rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                                {u.plan_slug ?? "free"}
                            </span>
                        </div>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500">Assinatura</p>
                            {u.subscription_active ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-100">
                                    Ativa
                                </span>
                            ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-100">
                                    Inativa
                                </span>
                            )}
                        </div>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500">Criado usuário</p>
                            <p className="text-sm">
                                {u.created_at_user
                                    ? new Date(u.created_at_user).toLocaleDateString("pt-BR")
                                    : "-"}
                            </p>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500">Criada em:</p>
                            <p className="text-sm">
                                {u.created_at_church
                                    ? new Date(u.created_at_church).toLocaleDateString("pt-BR")
                                    : "-"}
                            </p>
                        </div>

                        <button
                            onClick={() => onEdit(u)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 transition"
                        >
                            Alterar plano
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
