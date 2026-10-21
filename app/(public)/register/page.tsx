"use client";

import { useState } from "react";
import RegisterForm from "./components/registerForm";
import RegisterBackDrop from "./components/registerBackDrop";
import RegisterSuccessModal from "./components/modals/registerSucessModal";

import type { BillingCycle, PlanSlug } from "@/lib/plans";

export default function RegisterPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [planSlug, setPlanSlug] = useState<PlanSlug>("free");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");

  function handleSuccess(plan: PlanSlug, chosenCycle: BillingCycle, name: string, email: string) {
    setPlanSlug(plan);
    setCycle(chosenCycle);
    setRegisterName(name);
    setRegisterEmail(email);
    setShowSuccessModal(true);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-200 px-4 overflow-hidden">
      <RegisterForm onSuccess={handleSuccess} />

      {showSuccessModal && (
        <>
          <RegisterBackDrop />

          <RegisterSuccessModal
            open={showSuccessModal}
            planSlug={planSlug}
            cycle={cycle}
            name={registerName}
            email={registerEmail}
            onClose={() => setShowSuccessModal(false)}
          />
        </>
      )}
    </div>
  );
}
