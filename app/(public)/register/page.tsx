"use client";

import { useState } from "react";
import RegisterForm from "./components/registerForm";
import RegisterBackDrop from "./components/registerBackDrop";
import RegisterSuccessModal from "./components/modals/registerSucessModal";

export default function RegisterPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free");

  function handleSuccess(planSlug: string) {
    setSelectedPlan(planSlug);
    setShowSuccessModal(true);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-200 px-6 overflow-hidden">

      <RegisterForm onSuccess={handleSuccess} />

      {showSuccessModal && (
        <>
          <RegisterBackDrop />

          <RegisterSuccessModal
            open={showSuccessModal}
            plan={selectedPlan}
            onClose={() => setShowSuccessModal(false)}
          />
        </>
      )}
    </div>
  );
}
