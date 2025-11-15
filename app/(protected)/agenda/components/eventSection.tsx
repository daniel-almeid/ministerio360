"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import ModalNewEvent from "./modals/modalNewEvent";
import { useEvents } from "../hook/useEvents";
import { Ministry } from "../../../types/agenda";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

type Props = {
  ministries: Ministry[];
  onRefreshMinistries: () => void;
};

export default function EventSection({ ministries, onRefreshMinistries }: Props) {
  const {
    events,
    loading,
    filterMinistry,
    setFilterMinistry,
    grouped,
    nextEvent,
    load,
  } = useEvents(ministries, onRefreshMinistries);

  const [isOpen, setIsOpen] = useState(false);

  function isSoon(date: string) {
    const today = new Date();
    const eventDate = new Date(date);
    const diffDays = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700">Próximos eventos</h3>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm text-sm font-medium"
        >
          + Novo Evento
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="text-gray-600 text-sm">Filtrar por ministério:</label>
        <select
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#38B2AC] outline-none"
          value={filterMinistry}
          onChange={(e) => setFilterMinistry(e.target.value)}
        >
          <option value="">Todos</option>
          {ministries.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8 text-sm">Carregando eventos...</p>
      ) : events.length ? (
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
          {nextEvent && (
            <div className="p-6 mb-7 border-l-4 border-[#38B2AC] bg-[#E6FFFA] rounded-xl shadow-sm">
              <h4 className="text-lg font-semibold text-[#2C7A7B] mb-1">Próximo evento</h4>
              <p className="text-lg font-bold text-gray-800">{nextEvent.title}</p>
              <p className="text-base text-gray-700 flex items-center gap-2 mt-1">
                <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                {format(new Date(nextEvent.date), "dd/MM/yyyy", { locale: ptBR })} —{" "}
                {nextEvent.time?.slice(0, 5)}
              </p>

              {nextEvent.location && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-[#38B2AC]" />
                  {nextEvent.location}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {nextEvent.ministries?.length ? (
                  nextEvent.ministries.map((m) => (
                    <span
                      key={m.name}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold text-[#2C7A7B] bg-[#C6F6D5]"
                    >
                      <Users className="w-4 h-4" />
                      {m.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">Geral</span>
                )}
              </div>
            </div>
          )}

          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month} className="mb-6">
              <h4 className="font-semibold text-gray-600 mb-3 capitalize flex items-center gap-2 text-base">
                <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                {month}
              </h4>

              <ul className="space-y-2">
                {monthEvents.map((event) => (
                  <li
                    key={event.id}
                    className={`p-5 rounded-xl border transition-all duration-200 ${isSoon(event.date)
                      ? "bg-green-50 border-green-200"
                      : "hover:bg-gray-50 border-gray-100"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-gray-800 leading-snug">
                          {event.title}
                        </p>
                        <p className="text-base text-gray-700 flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                          {format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })} —{" "}
                          {event.time?.slice(0, 5)}
                        </p>

                        {event.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-[#38B2AC]" />
                            {event.location}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        {event.ministries?.length ? (
                          event.ministries.map((m) => (
                            <span
                              key={m.name}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold text-[#319795] bg-[#E6FFFA]"
                            >
                              <Users className="w-4 h-4" />
                              {m.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 italic">Geral</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">Nenhum evento cadastrado ainda.</p>
      )}

      {isOpen && (
        <ModalNewEvent eventData={null} onClose={() => setIsOpen(false)} onSuccess={load} />
      )}
    </section>
  );
}
