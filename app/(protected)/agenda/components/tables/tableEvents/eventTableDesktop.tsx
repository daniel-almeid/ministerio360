"use client";

import { EventItem } from "../../../../../types/agenda";
import { CalendarDays, MapPin, Pencil, Trash2, Users } from "lucide-react";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function EventTableDesktop({
    grouped,
    nextEvent,
    openEdit,
    openDelete,
}: any) {

    function isSoon(date: string) {
        const today = new Date();
        const eventDate = parseISO(date);
        const diff = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
    }

    return (
        <div className="hidden md:block">
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">

                {nextEvent && (
                    <div className="p-6 mb-7 border-l-4 border-[#38B2AC] bg-[#E6FFFA] rounded-xl">
                        <p className="text-lg font-bold text-gray-800">{nextEvent.title}</p>

                        <p className="text-base text-gray-700 flex items-center gap-2 mt-1">
                            <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                            {format(parseISO(nextEvent.date), "dd/MM/yyyy", { locale: ptBR })} — {nextEvent.time?.slice(0, 5)}
                        </p>

                        {nextEvent.location && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4 text-[#38B2AC]" />
                                {nextEvent.location}
                            </p>
                        )}

                        {nextEvent.ministries?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {nextEvent.ministries.map((m: any) => (
                                    <span
                                        key={m.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#319795] bg-[#E6FFFA] border border-[#81E6D9]"
                                    >
                                        <Users className="w-3 h-3" />
                                        {m.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {Object.entries(grouped).map(([month, events]: any) => (
                    <div key={month} className="mb-6">
                        <h4 className="font-semibold text-gray-600 mb-3 capitalize">{month}</h4>

                        <ul className="space-y-2">
                            {events.map((event: EventItem) => {
                                const ministries = event.ministries ?? [];

                                return (
                                    <li
                                        key={event.id}
                                        className={`p-5 rounded-xl border bg-white shadow-sm ${isSoon(event.date)
                                            ? "border-green-200 bg-green-50"
                                            : "border-gray-100 hover:bg-gray-50"
                                            }`}
                                    >
                                        <p className="text-lg font-semibold text-gray-800">
                                            {event.title}
                                        </p>

                                        <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                                            <CalendarDays className="w-5 h-5 text-[#38B2AC]" />
                                            {format(parseISO(event.date), "dd/MM/yyyy", { locale: ptBR })} — {event.time?.slice(0, 5)}
                                        </p>

                                        {event.location && (
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-[#38B2AC]" />
                                                {event.location}
                                            </p>
                                        )}

                                        {ministries.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {ministries.map((m: any) => (
                                                    <span
                                                        key={m.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#319795] bg-[#E6FFFA] border border-[#81E6D9]"
                                                    >
                                                        <Users className="w-3 h-3" />
                                                        {m.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                onClick={() => openEdit(event)}
                                                className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs flex items-center gap-1"
                                            >
                                                <Pencil className="w-4 h-4" /> Editar
                                            </button>

                                            <button
                                                onClick={() => openDelete(event)}
                                                className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" /> Excluir
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
