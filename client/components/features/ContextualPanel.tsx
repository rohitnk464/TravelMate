"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Car, Hotel, Map, Utensils, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { useJourney } from "@/context/JourneyContext";

interface Action {
    label: string;
    icon: any;
    color: string;
}

const actions: Record<string, Action[]> = {
    arrival: [
        { label: "Book Airport Transfer", icon: Car, color: "bg-blue-500" },
        { label: "Find Nearby Hotels", icon: Hotel, color: "bg-purple-500" },
    ],
    hotel: [
        { label: "View Hotel Safety Rating", icon: ShieldCheck, color: "bg-green-500" },
        { label: "Order Room Service", icon: Utensils, color: "bg-orange-500" },
    ],
    food: [
        { label: "Find Vegetarian Options", icon: Utensils, color: "bg-green-500" },
        { label: "View Top Rated", icon: Map, color: "bg-yellow-500" },
    ],
    explore: [
        { label: "Safe Walking Routes", icon: Map, color: "bg-blue-500" },
        { label: "Hire Verified Translator", icon: ShieldCheck, color: "bg-purple-500" },
    ],
    return: [
        { label: "Book Safe Cab", icon: Car, color: "bg-green-500" },
        { label: "Share Live Status", icon: ShieldCheck, color: "bg-red-500" },
    ]
};

export default function ContextualPanel({ currentStep }: { currentStep: string }) {
    const { isSafetyMode, setPendingAction } = useJourney();
    const currentActions = actions[currentStep] || [];

    return (
        <div className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl transition-all duration-500">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-wider text-gray-300">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Suggested Actions</span>
                {isSafetyMode && (
                    <span className="ml-auto text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Safety Mode
                    </span>
                )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                    {currentActions.map((action, index) => (
                        <motion.button
                            key={action.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setPendingAction(action.label)}
                            className={`border p-3 rounded-xl flex items-center gap-3 transition-all group text-left w-full ${isSafetyMode && (action.icon === ShieldCheck || action.icon === Map)
                                ? "bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30"
                                : "bg-white/10 hover:bg-white/20 border-white/10"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                                <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{action.label}</div>
                                <div className="text-[10px] text-gray-300 font-medium">
                                    {isSafetyMode && (action.icon === ShieldCheck || action.icon === Map) ? "Recommended for Safety" : "Popular Choice"}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
