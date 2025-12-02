"use client";

import { useState } from "react";
import RegisterForm from "./components/registerForm";
import RegisterBackDrop from "./components/registerBackDrop";
import RegisterSuccessModal from "./components/modals/registerSucessModal";

type PlanSlug = "free" | "standard" | "premium";

export default function RegisterPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [planSlug, setPlanSlug] = useState<PlanSlug>("free");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");

  function handleSuccess(plan: PlanSlug, name: string, email: string) {
    setPlanSlug(plan);
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
            name={registerName}
            email={registerEmail}
            onClose={() => setShowSuccessModal(false)}
          />
        </>
      )}
    </div>
  );
}
