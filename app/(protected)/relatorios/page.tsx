"use client";

import { useState, useEffect } from "react";
import Loading from "@/components/shared/loading";
import { useFinancialReport } from "./hooks/useFinancialReport";
import { useMembersReport } from "./hooks/useMembersReport";
import { FinancialReportSection } from "./components/financialReportSection";
import { MembersReportSection } from "./components/membersReportSection";
import { generatePdfReport } from "./components/pdfGenerator";
import { formatMonthName } from "./utils/formatMonth";

export default function ReportsPage() {
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    });

    const {
        financialData,
        loadingFinancial,
        loadFinancialReport,
    } = useFinancialReport();

    const {
        loadingMembers,
        activeMembers,
        monthlyVisitors,
        loadMembersReport,
    } = useMembersReport();

    useEffect(() => {
        loadFinancialReport(selectedMonth);
        loadMembersReport(selectedMonth);
    }, [selectedMonth]);

    const isLoading = loadingFinancial || loadingMembers;

    function handleGeneratePdf() {
        const monthLabel = formatMonthName(selectedMonth);

        generatePdfReport({
            selectedMonth,
            monthLabel,
            financialData,
            activeMembers,
            monthlyVisitors,
        });
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <Loading />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                    Relatórios
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                    Veja as estatísticas financeiras e de membros.
                </p>
            </header>

            <FinancialReportSection
                month={selectedMonth}
                financialData={financialData}
                loading={loadingFinancial}
                onChangeMonth={setSelectedMonth}
                onGeneratePdf={handleGeneratePdf}
            />

            <MembersReportSection
                loading={loadingMembers}
                activeMembers={activeMembers}
                monthlyVisitors={monthlyVisitors}
            />
        </div>
    );
}
