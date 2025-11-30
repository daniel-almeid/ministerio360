"use client";

import { useRouter } from "next/navigation";

export default function PlanosFooter() {
    const router = useRouter();

    function goToAlterarPlano() {
        router.push("/planos/assinatura");
    }

    return (
        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">

            <button
                onClick={goToAlterarPlano}
                className="py-3 px-6 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
            >
                Alterar plano
            </button>
        </div>
    );
}
