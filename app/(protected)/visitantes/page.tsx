"use client";

import { useState } from "react";
import { useVisitorsData } from "./hook/useVisitorsData";
import VisitorModal from "./components/modals/newVisitor";
import VisitorDetailsDrawer from "./components/drawer/detailsDrawer";
import VisitorTable from "./components/visitorTable";

export default function VisitantesPage() {
    const {
        visitors,
        loading,
        search,
        setSearch,
        filteredVisitors,
        loadVisitors,
        showArchived,
        setShowArchived,
    } = useVisitorsData();

    const [openModal, setOpenModal] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);

    return (
        <div className="space-y-0.5 pb-0.5">
            <h2 className="text-2xl font-semibold text-gray-700">Visitantes</h2>

            <VisitorTable
                visitors={filteredVisitors}
                loading={loading}
                search={search}
                setSearch={setSearch}
                showArchived={showArchived}
                onToggleArchived={() => setShowArchived(!showArchived)}
                onNewClick={() => setOpenModal(true)}
                onSelect={(v) => setSelectedVisitor(v)}
            />

            {openModal && (
                <VisitorModal
                    onClose={() => setOpenModal(false)}
                    onSuccess={loadVisitors}
                />
            )}

            {selectedVisitor && (
                <VisitorDetailsDrawer
                    visitor={selectedVisitor}
                    onClose={() => setSelectedVisitor(null)}
                    onUpdated={loadVisitors}
                />
            )}
        </div>
    );
}
