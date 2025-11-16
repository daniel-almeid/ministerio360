"use client";

import Loading from "@/components/shared/loading";

export function MembersReportSection({
    loading,
    activeMembers,
    monthlyVisitors,
}: any) {
    return (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Relatório de membros
            </h3>

            {loading ? (
                <div className="py-6 text-center">
                    <Loading />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-gray-500 text-sm">Membros ativos</p>
                        <p className="text-2xl font-bold text-gray-800">{activeMembers}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-gray-500 text-sm">Visitantes nesse mês</p>
                        <p className="text-2xl font-bold text-gray-800">{monthlyVisitors}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
