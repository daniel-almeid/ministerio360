"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import ModalNewEvent from "./modals/modalNewEvent";
import ModalEditEvent from "./modals/modalEditEvent";
import ConfirmDeleteModal from "./modals/confirmDeleteModal";
import { useEvents } from "../hook/useEvents";
import { Ministry } from "../../../types/agenda";
import EventTable from "./tables/tableEvents/eventTable";
import { CustomSelect } from "@/components/shared/customSelect";

type Props = {
  ministries: Ministry[];
  onRefreshMinistries: () => void;
};

export default function EventSection({ ministries, onRefreshMinistries }: Props) {
  const {
    loading,
    filterMinistry,
    setFilterMinistry,
    grouped,
    nextEvent,
    load,
    selected,
    showNew,
    showEdit,
    showDelete,
    openNew,
    openEdit,
    openDelete,
    closeAll,
    confirmDelete,
  } = useEvents(ministries, onRefreshMinistries);

  const ministryNames = ["Todos", ...ministries.map((m) => m.name)];

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700">Próximos eventos</h3>

        <button
          onClick={openNew}
          className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm text-sm font-medium"
        >
          + Novo Evento
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <CustomSelect
          label="Filtrar por ministério:"
          value={filterMinistry}
          onChange={(v) => setFilterMinistry(v)}
          options={ministryNames}
        />
      </div>

      <EventTable
        grouped={grouped}
        nextEvent={nextEvent}
        loading={loading}
        openEdit={openEdit}
        openDelete={openDelete}
        filterMinistry={filterMinistry}
        setFilterMinistry={setFilterMinistry}
        ministries={ministries}
      />

      {showNew && (
        <ModalNewEvent eventData={null} onClose={closeAll} onSuccess={load} />
      )}

      {showEdit && selected && (
        <ModalEditEvent
          open
          event={selected}
          onClose={closeAll}
          onSuccess={load}
        />
      )}

      {showDelete && selected && (
        <ConfirmDeleteModal
          open
          onClose={closeAll}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}
