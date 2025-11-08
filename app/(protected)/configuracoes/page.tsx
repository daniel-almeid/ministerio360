"use client";

import { ConfigForm } from "./components/ConfigForm";

export default function ConfiguracoesPage() {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-5xl space-y-10">
                <header className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Configurações da Igreja</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Gerencie as informações institucionais, de contato e endereço da igreja.
                    </p>
                </header>

                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
                        Informações Gerais da Igreja
                    </h3>
                    <ConfigForm />
                </section>
            </div>
        </div>
    );
}
