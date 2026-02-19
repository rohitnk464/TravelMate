"use client";

import { Wifi, WifiOff, CloudOff } from "lucide-react";
import { useJourney } from "@/context/JourneyContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NetworkIndicator() {
    const { isOnline, isLowConnectivity } = useJourney();

    if (isOnline && !isLowConnectivity) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md border ${!isOnline
                        ? "bg-slate-900/90 border-slate-700 text-slate-300"
                        : "bg-yellow-900/90 border-yellow-700 text-yellow-300"
                    }`}
            >
                {!isOnline ? (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span className="text-xs font-bold">Offline Mode Active</span>
                    </>
                ) : (
                    <>
                        <CloudOff className="w-4 h-4" />
                        <span className="text-xs font-bold">Low Connectivity Detected</span>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
