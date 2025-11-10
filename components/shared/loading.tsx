"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-gray-600 bg-linear-to-b from-white to-gray-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="relative"
            >
                <div className="absolute inset-0 blur-lg opacity-30 bg-teal-400 rounded-full" />
                <Loader2 className="w-12 h-12 text-teal-600 relative z-10" />
            </motion.div>

            <motion.p
                className="mt-5 text-base font-medium text-gray-700"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
            >
                Carregando...
            </motion.p>

            <div className="w-40 h-1.5 bg-gray-200 rounded-full mt-5 overflow-hidden">
                <motion.div
                    className="h-full bg-linear-to-r from-teal-500 to-teal-400"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        ease: "easeInOut",
                    }}
                />
            </div>
        </div>
    );
}
