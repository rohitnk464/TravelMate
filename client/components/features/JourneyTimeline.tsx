"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, MapPin, BedDouble, Utensils, Compass, ArrowRight, ShieldCheck, Clock, Info } from "lucide-react";
import { useJourney } from "@/context/JourneyContext";
import { useState } from "react";

interface Step {
    id: string;
    label: string;
    title?: string;
    description?: string;
    icon: any;
    time?: string;
    safety?: number;
}

const defaultSteps: Step[] = [
    { id: "arrival", label: "Arrival", title: "City Arrival", icon: MapPin },
    { id: "hotel", label: "Check-in", title: "Hotel Check-in", icon: BedDouble },
    { id: "food", label: "Find Food", title: "Lunch Break", icon: Utensils },
    { id: "explore", label: "Explore", title: "Sightseeing", icon: Compass },
    { id: "return", label: "Return", title: "Back to Base", icon: ArrowRight },
];

export default function JourneyTimeline({ currentStep }: { currentStep: string }) {
    const { isSafetyMode, timeline } = useJourney();
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    // Convert AI timeline to steps if available, otherwise use default
    const displaySteps: Step[] = timeline.length > 0
        ? timeline.map((t: any, i: number) => ({
            id: `step-${i}`,
            label: t.time,
            title: t.title,
            description: t.description,
            icon: t.type === 'food' || t.type === 'restaurant' || t.type === 'cafe' ? Utensils :
                (t.type === 'attraction' || t.type === 'viewpoint' || t.type === 'museum' ? Compass : MapPin),
            time: t.time,
            safety: t.safetyScore
        }))
        : defaultSteps;

    // Determine current index
    const currentIndex = timeline.length > 0 ? 0 : defaultSteps.findIndex(s => s.id === currentStep);

    return (
        <div className="w-full p-6 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 blur-sm opacity-50 animate-pulse rounded-full" />
                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white relative z-10" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Journey</h3>
                        <p className="text-[10px] text-gray-400 font-mono">
                            {timeline.length > 0 ? "AI OPTIMIZED ROUTE" : "STANDARD ITINERARY"}
                        </p>
                    </div>
                </div>

                {isSafetyMode && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full"
                    >
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-300 tracking-wider">GUARDIAN ACTIVE</span>
                    </motion.div>
                )}
            </div>

            {/* Timeline Container */}
            <div className="relative mx-4">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                </div>

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentIndex / (displaySteps.length - 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                />

                {/* Steps */}
                <div className="relative flex justify-between items-center w-full">
                    {displaySteps.map((step, index) => {
                        const isActive = index === currentIndex;
                        const isCompleted = index < currentIndex;
                        const isHovered = hoveredStep === index;

                        return (
                            <div
                                key={step.id}
                                className="relative group cursor-pointer"
                                onMouseEnter={() => setHoveredStep(index)}
                                onMouseLeave={() => setHoveredStep(null)}
                            >
                                {/* Step Circle */}
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.3 : isHovered ? 1.1 : 1,
                                        backgroundColor: isActive || isCompleted ? "#000" : "#111",
                                        borderColor: isActive ? "#a855f7" : isCompleted ? "#3b82f6" : "#333",
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-20 relative transition-colors duration-300`}
                                >
                                    <step.icon className={`w-4 h-4 ${isActive ? "text-purple-400" : isCompleted ? "text-blue-400" : "text-gray-600"}`} />

                                    {/* Active Pulse Ring */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-purple-500"
                                            initial={{ scale: 1, opacity: 1 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold transition-colors duration-300 ${isActive ? "text-white" : "text-gray-500"}`}>
                                    {step.label}
                                </div>

                                {/* Hover Tooltip (Premium Glassmorphism) */}
                                <AnimatePresence>
                                    {(isHovered || isActive) && step.title && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: -50, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl z-50 pointer-events-none"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] text-gray-400 font-mono uppercase">{step.time || "Scheduled"}</span>
                                                {step.safety && (
                                                    <span className={`text-[10px] font-bold px-1.5 rounded ${step.safety >= 9 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {step.safety.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm font-bold text-white mb-1 line-clamp-1">{step.title}</div>
                                            {step.description && (
                                                <div className="text-xs text-gray-400 line-clamp-2 leading-tight">{step.description}</div>
                                            )}

                                            {/* Arrow */}
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/80 border-r border-b border-white/20" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
