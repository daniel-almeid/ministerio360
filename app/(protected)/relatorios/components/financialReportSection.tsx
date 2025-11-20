"use client";

import Loading from "@/components/shared/loading";

export function FinancialReportSection({
    month,
    financialData,
    loading,
    onChangeMonth,
    onGeneratePdf,
}: any) {
    const totalIncome = financialData.reduce((acc: any, i: any) => acc + i.income, 0);
    const totalExpense = financialData.reduce((acc: any, i: any) => acc + i.expense, 0);
    const totalBalance = totalIncome - totalExpense;

    return (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-700">
                    Relatório Financeiro
                </h3>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => onChangeMonth(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none w-full sm:w-auto"
                    />

                    <button
                        onClick={onGeneratePdf}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all w-full sm:w-auto"
                    >
                        Gerar PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-6 text-center">
                    <Loading />
                </div>
            ) : financialData.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                    Nenhuma transação encontrada neste mês.
                </p>
            ) : (
                <>
                    {/* DESKTOP */}
                    <div className="hidden md:block max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-sm border-separate border-spacing-y-1">
                            <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                <tr className="text-gray-500 border-b">
                                    <th className="pb-3 text-left">Categoria</th>
                                    <th className="pb-3 text-right">Entrada</th>
                                    <th className="pb-3 text-right">Saída</th>
                                    <th className="pb-3 text-right">Balanço</th>
                                </tr>
                            </thead>

                            <tbody>
                                {financialData.map((item: any) => (
                                    <tr key={item.category} className="hover:bg-gray-50">
                                        <td className="py-2 text-gray-700">{item.category}</td>
                                        <td className="py-2 text-green-600 text-right font-medium">
                                            R$ {item.income.toFixed(2).replace(".", ",")}
                                        </td>
                                        <td className="py-2 text-red-600 text-right font-medium">
                                            R$ {item.expense.toFixed(2).replace(".", ",")}
                                        </td>
                                        <td className="py-2 text-right font-semibold text-gray-800">
                                            R$ {item.balance.toFixed(2).replace(".", ",")}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="bg-gray-50 border-t font-semibold">
                                    <td className="py-3 text-gray-800">Total</td>
                                    <td className="py-3 text-green-700 text-right">
                                        R$ {totalIncome.toFixed(2).replace(".", ",")}
                                    </td>
                                    <td className="py-3 text-red-700 text-right">
                                        R$ {totalExpense.toFixed(2).replace(".", ",")}
                                    </td>
                                    <td
                                        className={`py-3 text-right ${
                                            totalBalance >= 0 ? "text-green-700" : "text-red-700"
                                        }`}
                                    >
                                        R$ {totalBalance.toFixed(2).replace(".", ",")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE */}
                    <div className="md:hidden max-h-[400px] overflow-y-auto pr-1 custom-scrollbar space-y-4">
                        {financialData.map((item: any) => (
                            <div
                                key={item.category}
                                className="p-4 rounded-xl border border-gray-200 shadow-sm bg-white"
                            >
                                <p className="text-gray-900 font-semibold text-base">{item.category}</p>

                                <div className="mt-2 text-[15px] text-gray-700 space-y-1">
                                    <p className="flex justify-between">
                                        <span>Entrada:</span>
                                        <span className="text-green-600 font-medium">
                                            R$ {item.income.toFixed(2).replace(".", ",")}
                                        </span>
                                    </p>

                                    <p className="flex justify-between">
                                        <span>Saída:</span>
                                        <span className="text-red-600 font-medium">
                                            R$ {item.expense.toFixed(2).replace(".", ",")}
                                        </span>
                                    </p>

                                    <p className="flex justify-between">
                                        <span>Balanço:</span>
                                        <span className="font-semibold text-gray-800">
                                            R$ {item.balance.toFixed(2).replace(".", ",")}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="p-4 rounded-xl bg-gray-50 border font-semibold">
                            <p className="flex justify-between text-gray-800">
                                <span>Total:</span>
                                <span>R$ {totalBalance.toFixed(2).replace(".", ",")}</span>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
