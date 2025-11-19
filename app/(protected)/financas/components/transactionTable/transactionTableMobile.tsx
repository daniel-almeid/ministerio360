"use client";

import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Pencil,
    Trash,
} from "lucide-react";
import Loading from "@/components/shared/loading";

export function TransactionTableMobile({
    data,
    onEdit,
    onDelete,
    pageChanging,
}: any) {
    return (
        <div className="md:hidden space-y-4 mt-2">

            {pageChanging && (
                <div className="flex justify-center items-center py-6">
                    <Loading />
                </div>
            )}

            {!pageChanging &&
                data.map((t: any) => (
                    <div
                        key={t.id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 animate-fadeIn"
                    >
                        <div className="flex items-center gap-2 text-[15px] font-semibold mb-2">
                            {t.type === "entrada" ? (
                                <>
                                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-green-700">Entrada</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-red-700">Saída</span>
                                </>
                            )}
                        </div>

                        <p className="text-gray-700 text-[15px] mb-1">
                            <span className="font-semibold">Categoria:</span> {t.category}
                        </p>

                        <p className="text-gray-800 text-[15px] font-semibold mb-1">
                            Valor: R$ {Number(t.amount).toFixed(2).replace(".", ",")}
                        </p>

                        <p className="text-gray-700 text-[15px] mb-1">
                            <span className="font-semibold">Pessoa / Motivo:</span>{" "}
                            {t.person_name || "-"}
                        </p>

                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                            <Calendar className="w-4 h-4 text-[#38B2AC]" />
                            {new Date(t.created_at).toLocaleDateString("pt-BR")}
                        </div>

                        <div className="flex justify-end gap-5 pt-2">
                            <button
                                onClick={() => onEdit(t)}
                                className="text-emerald-600 hover:text-emerald-700 transition"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => onDelete(t.id)}
                                className="text-red-600 hover:text-red-700 transition"
                            >
                                <Trash className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}
