"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DrawerScaleDetails({ scaleId, onClose }: { scaleId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scaleId) loadDetails();
  }, [scaleId]);

  async function loadDetails() {
    setLoading(true);
    const { data: scale } = await supabase
      .from("scales")
      .select("id, date, event_name, responsible, ministries")
      .eq("id", scaleId)
      .single();
    setData(scale);
    setLoading(false);
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <motion.div className="relative bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto rounded-l-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Detalhes da Escala</h3>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {loading || !data ? (
            <p>Carregando...</p>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">{format(new Date(data.date), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>

              <div className="border-b pb-3">
                <p className="text-sm text-gray-500">Evento</p>
                <p className="font-medium">{data.event_name}</p>
              </div>

              <div className="border-b pb-3">
                <p className="text-sm text-gray-500">Responsável</p>
                <p className="font-medium">{data.responsible}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Ministérios</p>
                {data.ministries.length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhum ministério listado.</p>
                ) : (
                  data.ministries.map((m: any) => (
                    <div key={m.id} className="mb-3">
                      <p className="font-semibold text-[#319795]">{m.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
