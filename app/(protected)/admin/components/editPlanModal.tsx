"use client";

import { useState } from "react";
import type { AdminUser } from "../hook/useAdminPlans";
import { CustomSelect } from "../../../../components/shared/customSelect";

export default function EditPlanModal({
    user,
    open,
    onClose,
    onSave,
    saving,
}: {
    user: AdminUser | null;
    open: boolean;
    onClose: () => void;
    onSave: (v: { plan_slug: string; subscription_active: boolean }) => void;
    saving: boolean;
}) {
    if (!open || !user) return null;

    const [plan, setPlan] = useState(user.plan_slug ?? "free");
    const [active, setActive] = useState(!!user.subscription_active);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-lg font-semibold mb-4">
                    Editar plano – {user.church_name ?? "-"}
                </h2>

                <CustomSelect
                    label="Plano"
                    value={plan}
                    onChange={setPlan}
                    options={["free", "standard", "premium"]}
                />

                <label className="flex items-center gap-2 text-sm mt-4 mb-4">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                    Assinatura ativa
                </label>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={() =>
                            onSave({
                                plan_slug: plan,
                                subscription_active: active,
                            })
                        }
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg"
                        disabled={saving}
                    >
                        {saving ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
