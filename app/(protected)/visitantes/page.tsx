"use client";

import { useState } from "react";
import { useVisitorsData } from "./hook/useVisitorsData";
import VisitorModal from "./components/modals/newVisitor";
import VisitorDetailsDrawer from "./components/drawer/detailsDrawer";
import VisitorTable from "./components/visitorTable";
import MemberModal from "../membros/components/modals/newMember";
import { convertVisitorToMember } from "../../services/visitors";
import toast from "react-hot-toast";

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
    // "Tornar membro": abre o cadastro de membro já preenchido com os dados do visitante
    const [convertFor, setConvertFor] = useState<any | null>(null);

    async function memberSaved(v: any) {
        try {
            await convertVisitorToMember(v.id);
            toast.success(`${v.name.split(" ")[0]} agora é membro da igreja`);
        } catch {
            toast.error("O membro foi cadastrado, mas não deu para arquivar o visitante. Arquive pelo detalhe.");
        }
        loadVisitors();
    }

    return (
        <div className="space-y-0.5 pb-0.5">
            <h2 className="text-2xl font-semibold text-gray-700"></h2>

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
                    onConvert={(v) => {
                        setSelectedVisitor(null);
                        setConvertFor(v);
                    }}
                />
            )}

            {convertFor && (
                <MemberModal
                    key={convertFor.id}
                    title="Tornar membro"
                    prefill={{ name: convertFor.name, phone: convertFor.phone, email: convertFor.email }}
                    onClose={() => setConvertFor(null)}
                    onSuccess={() => memberSaved(convertFor)}
                />
            )}
        </div>
    );
}
