"use client";

import { useScales } from "../hook/useScales";
import ModalNewScale from "./modals/modalNewScale";
import ModalEditScale from "./modals/modalEditScale";
import ConfirmDeleteModal from "./modals/confirmDeleteModal";
import DrawerScaleDetails from "./drawer/drawerScaleDetails";
import { Calendar, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScaleTableMobile } from "./tables/tableScale/scaleTableMobile";

type Props = {
    ministries: any[];
};

export default function ScaleSection({ ministries }: Props) {
    const {
        scales,
        loading,
        selected,
        drawerOpen,
        showNew,
        showEdit,
        showDelete,
        deleting,
        openNew,
        openView,
        openEdit,
        openDelete,
        closeAll,
        confirmDelete,
        load
    } = useScales();

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Escala Semanal</h3>

                <button
                    onClick={openNew}
                    className="px-3 py-2 bg-[#38B2AC] text-white rounded-lg hover:bg-[#319795] transition-all shadow-sm"
                >
                    + Nova Escala
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500 text-center py-8">Carregando escalas...</p>
            ) : scales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma escala cadastrada.</p>
            ) : (
                <>
                    {/* DESKTOP */}
                    <div className="hidden md:block max-h-[340px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth rounded-xl">
                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-50/60 border-b border-gray-100 text-gray-500 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Evento</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Ministérios</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Responsável</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Ações</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {scales.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-all duration-200">
                                        <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#38B2AC]" />
                                                {format(parseISO(item.date), "dd/MM", { locale: ptBR })}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-700 font-medium truncate">{item.event}</td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                {item.ministries?.map((m) => (
                                                    <span key={m.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#319795] bg-[#E6FFFA]">
                                                        <Users className="w-3 h-3" />
                                                        {m.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                            {item.responsible}
                                        </td>

                                        <td className="px-4 py-3 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => openView(item)}
                                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => openEdit(item)}
                                                className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => openDelete(item)}
                                                className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE */}
                    <ScaleTableMobile
                        scales={scales}
                        openView={openView}
                        openEdit={openEdit}
                        openDelete={openDelete}
                    />
                </>
            )}

            {showNew && (
                <ModalNewScale
                    onClose={closeAll}
                    onSuccess={load}
                    ministries={ministries}
                />
            )}

            {showEdit && selected && (
                <ModalEditScale
                    onClose={closeAll}
                    onSuccess={load}
                    ministries={ministries}
                    scaleData={selected}
                />
            )}

            {showDelete && selected && (
                <ConfirmDeleteModal
                    open
                    onClose={closeAll}
                    onConfirm={confirmDelete}
                    loading={deleting}
                />
            )}

            {drawerOpen && selected && (
                <DrawerScaleDetails scaleId={selected.id} onClose={closeAll} />
            )}
        </section>
    );
}
