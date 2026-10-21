"use client";

import { useState } from "react";
import type { AdminUser } from "../hook/useAdminPlans";
import { CustomSelect } from "../../../../components/shared/customSelect";
import { CYCLE_LABEL, PLAN_NAME, PLAN_SLUGS, isPlanSlug, type BillingCycle, type PlanSlug } from "@/lib/plans";

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
    onSave: (v: { plan_slug: string; subscription_active: boolean; billing_cycle: BillingCycle }) => void;
    saving: boolean;
}) {
    if (!open || !user) return null;
    return <EditPlanForm user={user} onClose={onClose} onSave={onSave} saving={saving} />;
}

function EditPlanForm({
    user,
    onClose,
    onSave,
    saving,
}: {
    user: AdminUser;
    onClose: () => void;
    onSave: (v: { plan_slug: string; subscription_active: boolean; billing_cycle: BillingCycle }) => void;
    saving: boolean;
}) {
    const [plan, setPlan] = useState<PlanSlug>(isPlanSlug(user.plan_slug) ? user.plan_slug : "free");
    const [cycle, setCycle] = useState<BillingCycle>(user.billing_cycle === "yearly" ? "yearly" : "monthly");
    const [active, setActive] = useState(!!user.subscription_active);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-lg font-semibold mb-4">
                    Editar plano – {user.church_name ?? "-"}
                </h2>

                <CustomSelect
                    label="Plano"
                    value={PLAN_NAME[plan]}
                    onChange={(value) => setPlan(PLAN_SLUGS.find((s) => PLAN_NAME[s] === value) ?? "free")}
                    options={PLAN_SLUGS.map((s) => PLAN_NAME[s])}
                />

                {plan !== "free" && (
                    <div className="mt-4">
                        <CustomSelect
                            label="Cobrança"
                            value={CYCLE_LABEL[cycle]}
                            onChange={(value) => setCycle(value === CYCLE_LABEL.yearly ? "yearly" : "monthly")}
                            options={[CYCLE_LABEL.monthly, CYCLE_LABEL.yearly]}
                        />
                    </div>
                )}

                <label className="flex items-center gap-2 text-sm mt-4 mb-4">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                    Assinatura ativa
                </label>

                <p className="text-xs text-gray-500 mb-4">
                    Isso muda só o acesso no Ministério360. A cobrança no Pagar.me não é alterada.
                </p>

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
                                billing_cycle: cycle,
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
