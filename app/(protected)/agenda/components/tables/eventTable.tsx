"use client";

import { EventItem, Ministry } from "../../../../types/agenda";
import { CalendarDays, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
    grouped: Record<string, EventItem[]>;
    nextEvent: EventItem | null;
    loading: boolean;
    ministries: Ministry[];
    filterMinistry: string;
    setFilterMinistry: (v: string) => void;

    // NOVOS:
    openNew: () => void;
    openView: (ev: EventItem) => void;
    openEdit: (ev: EventItem) => void;
    openDelete: (ev: EventItem) => void;
};

export default function EventTable({
    grouped,
    nextEvent,
    loading,
    ministries,
    filterMinistry,
    setFilterMinistry,

    openNew,
    openView,
    openEdit,
    openDelete,
}: Props) {
    function isSoon(date: string) {
        const today = new Date();
        const eventDate = parseISO(date);
        const diff = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
    }

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-700">Eventos</h3>

                <button
                    onClick={openNew}
                    className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795]"
                >
                    + Novo Evento
                </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <label className="text-gray-600 text-sm">Filtrar por ministério:</label>
                <select
                    value={filterMinistry}
                    onChange={(e) => setFilterMinistry(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
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
                <p className="text-gray-500 text-center py-8 text-sm">Carregando...</p>
            ) : (
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {nextEvent && (
                        <div className="p-6 mb-7 border-l-4 border-[#38B2AC] bg-[#E6FFFA] rounded-xl">
                            <p className="text-lg font-bold text-gray-800">{nextEvent.title}</p>

                            <p className="text-base text-gray-700 flex items-center gap-2 mt-1">
                                <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                                {format(parseISO(nextEvent.date), "dd/MM/yyyy", { locale: ptBR })} —{" "}
                                {nextEvent.time?.slice(0, 5)}
                            </p>

                            {nextEvent.location && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-[#38B2AC]" />
                                    {nextEvent.location}
                                </p>
                            )}
                        </div>
                    )}

                    {Object.entries(grouped).map(([month, events]) => (
                        <div key={month} className="mb-6">
                            <h4 className="font-semibold text-gray-600 mb-3 capitalize">{month}</h4>

                            <ul className="space-y-2">
                                {events.map((event) => (
                                    <li
                                        key={event.id}
                                        className={`p-5 rounded-xl border relative ${isSoon(event.date)
                                                ? "bg-green-50 border-green-200"
                                                : "hover:bg-gray-50 border-gray-100"
                                            }`}
                                    >
                                        <p className="text-lg font-semibold text-gray-800">
                                            {event.title}
                                        </p>

                                        <p className="text-sm text-gray-700 flex items-center gap-2">
                                            <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                                            {format(parseISO(event.date), "dd/MM/yyyy", {
                                                locale: ptBR,
                                            })}{" "}
                                            — {event.time?.slice(0, 5)}
                                        </p>

                                        <div className="flex gap-2 justify-end mt-4">
                                            <button
                                                onClick={() => openView(event)}
                                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200"
                                            >
                                                <Eye className="w-4 h-4" /> Ver
                                            </button>

                                            <button
                                                onClick={() => openEdit(event)}
                                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700"
                                            >
                                                <Pencil className="w-4 h-4" /> Editar
                                            </button>

                                            <button
                                                onClick={() => openDelete(event)}
                                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" /> Excluir
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
