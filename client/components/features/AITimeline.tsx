"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, MapPin, Search, Utensils, Map } from "lucide-react";
import { useJourney } from "@/context/JourneyContext";

// Map string icon names to components
const iconMap: any = {
    CheckCircle, AlertTriangle, MapPin, Search, Utensils, Map
};

export const AITimeline = () => {
    const { agentLogs } = useJourney();

    return (
        <div className="space-y-6 relative ml-2">
            {/* Vertical Line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-white/10" />

            <AnimatePresence mode="popLayout">
                {agentLogs.map((item, index) => {
                    const Icon = iconMap[item.icon] || MapPin;
                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="relative flex gap-4"
                        >
                            <div className={`relative z-10 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 bg-background ${item.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-200">{item.text}</div>
                                <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default AITimeline;
