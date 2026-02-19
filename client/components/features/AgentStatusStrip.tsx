"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Map, Utensils, Shield, ChevronDown, Activity, Play, Radio, ShieldCheck, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useJourney } from "@/context/JourneyContext";
import { useSearchParams } from "next/navigation";

type AgentId = "orch" | "city" | "food" | "safe";

interface Agent {
    id: AgentId;
    name: string;
    icon: any;
    status: string;
    risk?: string;
    score?: string;
    desc: string;
    action: string;
    color: string;
    gradient: string;
    stats: { label: string; value: string }[];
}

const agents: Agent[] = [
    {
        id: "orch",
        name: "Orchestrator",
        icon: Brain,
        status: "Active",
        desc: "Managing your travel context & preferences.",
        action: "Optimize Route",
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-blue-500/20",
        stats: [
            { label: "Context", value: "Syncing" },
            { label: "Battery", value: "Optimized" }
        ]
    },
    {
        id: "city",
        name: "City Intel",
        icon: Map,
        status: "Monitoring",
        desc: "Scanning traffic, weather, and crowded zones.",
        action: "Check Traffic",
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/20",
        stats: [
            { label: "Traffic", value: "Normal" },
            { label: "Weather", value: "Clear" }
        ]
    },
    {
        id: "food",
        name: "Culinary",
        icon: Utensils,
        status: "Standby",
        desc: "Locating top-rated safe dining options nearby.",
        action: "Find Spots",
        color: "text-orange-400",
        gradient: "from-orange-500/20 to-amber-500/20",
        stats: [
            { label: "Nearby", value: "12" },
            { label: "Rating", value: "4.8+" }
        ]
    },
    {
        id: "safe",
        name: "Guardian",
        icon: Shield,
        status: "High Alert",
        risk: "LOW RISK",
        score: "8.7/10",
        desc: "Continuous safety monitoring & risk assessment.",
        action: "Scan Zone",
        color: "text-green-400",
        gradient: "from-green-500/20 to-emerald-500/20",
        stats: [
            { label: "Alerts", value: "0" },
            { label: "Zone", value: "Safe" }
        ]
    },
];

const AgentStatusStrip = () => {
    const [activeTab, setActiveTab] = useState<AgentId | null>(null);
    const [isExploring, setIsExploring] = useState(false);
    const [simulationState, setSimulationState] = useState<Record<AgentId, string>>({
        orch: "Active",
        city: "Monitoring",
        food: "Standby",
        safe: "High Alert"
    });

    // Get context and location
    const {
        setPendingAction,
        orchestratorStatus,
        setOrchestratorStatus,
        trafficData,
        setTrafficData,
        restaurantCount,
        setRestaurantCount,
        safetyScore,
        setSafetyScore,
        selectedCity
    } = useJourney();
    const searchParams = useSearchParams();
    const location = selectedCity || searchParams.get("location") || "Bengaluru";

    // Handle "Start Exploring" Simulation
    const handleStartExploring = () => {
        setIsExploring(true);
        setActiveTab("orch");

        // Real action sequence
        setTimeout(() => {
            setSimulationState(prev => ({ ...prev, orch: "Optimizing Route..." }));
            setPendingAction("Plan Day");
        }, 0);

        setTimeout(() => {
            setSimulationState(prev => ({ ...prev, city: "Checking Traffic..." }));
            setTrafficData({
                level: Math.random() > 0.5 ? "Normal" : "Heavy",
                congestion: ["Beach Road", "Market Area"]
            });
        }, 800);

        setTimeout(() => {
            setSimulationState(prev => ({ ...prev, food: "Scanning Restaurants..." }));
            setPendingAction("Find Food");
            setRestaurantCount(Math.floor(Math.random() * 20) + 5);
        }, 1600);

        setTimeout(() => {
            setSimulationState(prev => ({ ...prev, safe: "Running Safety Scan..." }));
            setPendingAction("Safe Areas");
            setSafetyScore(Math.random() * 2 + 8);
        }, 2400);

        setTimeout(() => {
            setIsExploring(false);
            setSimulationState({
                orch: "Route Optimized",
                city: "Area Clear",
                food: `${restaurantCount} Spots Found`,
                safe: "Zone Secure"
            });
        }, 4000);
    };

    return (
        <div className="w-full bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-[72px] z-40 transition-all duration-300">
            <div className="container mx-auto px-6">

                {/* 1. Control Bar Header */}
                <div className="flex items-center justify-between h-14">
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mr-8">
                        <Activity className="w-3 h-3" />
                        AI Control
                    </div>

                    {/* Tabs Container */}
                    <div className="flex-1 flex items-center justify-center md:justify-start gap-2 overflow-x-auto no-scrollbar">
                        {agents.map((agent) => {
                            const isActive = activeTab === agent.id;
                            return (
                                <button
                                    key={agent.id}
                                    onClick={() => setActiveTab(isActive ? null : agent.id)}
                                    className={cn(
                                        "relative px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium transition-all duration-300 min-w-fit",
                                        isActive ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-colors",
                                        isActive ? ((agent.id === 'safe' && simulationState.safe.includes('Scan')) ? "bg-red-500 animate-ping" : agent.color.replace('text-', 'bg-')) : "bg-zinc-600"
                                    )} />

                                    {agent.name}

                                    {/* Live Status Indicator for non-active tabs */}
                                    {!isActive && simulationState[agent.id].includes("...") && (
                                        <motion.div layoutId="pulse" className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                    )}

                                    {/* Active Tab Underline & Glow */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className={cn("absolute inset-0 rounded-full bg-gradient-to-r opacity-20 -z-10", agent.gradient)}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Global Action */}
                    <button
                        onClick={handleStartExploring}
                        disabled={isExploring}
                        className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExploring ? (
                            <><Radio className="w-3 h-3 animate-spin" /> System Active</>
                        ) : (
                            <><Play className="w-3 h-3 fill-white" /> Start Exploring</>
                        )}
                    </button>

                    {/* Expand Toggle */}
                    <motion.div
                        animate={{ rotate: activeTab ? 180 : 0 }}
                        className="ml-4 text-muted-foreground"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>
                </div>
            </div>

            {/* 2. Expandable Panel */}
            <AnimatePresence>
                {activeTab && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="overflow-hidden border-t border-white/5 bg-black/40"
                    >
                        <div className="container mx-auto px-6 py-6">
                            {agents.map((agent) => {
                                if (agent.id !== activeTab) return null;
                                return (
                                    <motion.div
                                        key={agent.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                                    >
                                        {/* Left: Info */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-3 rounded-2xl bg-white/5 ${agent.color}`}>
                                                    <agent.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className={`text-lg font-bold ${agent.color}`}>{agent.name}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-white font-medium">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${agent.color.replace('text-', 'bg-')} animate-pulse`} />
                                                        {simulationState[agent.id]}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {agent.desc}
                                            </p>
                                        </div>

                                        {/* Middle: Stats */}
                                        <div className="flex items-center justify-around bg-white/5 rounded-2xl p-4 border border-white/5">
                                            {agent.id === 'safe' ? (
                                                <>
                                                    <div className="text-center">
                                                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Risk Level</div>
                                                        <div className="text-xl font-bold text-green-400">{agent.risk}</div>
                                                    </div>
                                                    <div className="w-px h-8 bg-white/10" />
                                                    <div className="text-center">
                                                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Safety Score</div>
                                                        <div className="text-xl font-bold text-white">{agent.score}</div>
                                                    </div>
                                                </>
                                            ) : (
                                                agent.stats.map((stat, idx) => (
                                                    <div key={idx} className="text-center">
                                                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
                                                        <div className="text-xl font-bold text-white">{stat.value}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex flex-col justify-center gap-3">
                                            <button
                                                onClick={() => {
                                                    if (agent.id === "orch") setPendingAction("Plan Day");
                                                    else if (agent.id === "city") {
                                                        setTrafficData({
                                                            level: Math.random() > 0.5 ? "Normal" : "Heavy",
                                                            congestion: ["Beach Road", "Market Area"]
                                                        });
                                                    }
                                                    else if (agent.id === "food") {
                                                        setPendingAction("Find Food");
                                                        setRestaurantCount(Math.floor(Math.random() * 20) + 5);
                                                    }
                                                    else if (agent.id === "safe") {
                                                        setPendingAction("Safe Areas");
                                                        setSafetyScore(Math.random() * 2 + 8);
                                                    }
                                                }}
                                                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 group">
                                                <Zap className={`w-4 h-4 ${agent.color} group-hover:fill-current`} />
                                                {agent.action}
                                            </button>
                                            <div className="text-[10px] text-center text-muted-foreground">
                                                {agent.id === 'safe' ? "Real-time surveillance active" : "AI Context Engine v2.4 Active"}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AgentStatusStrip;
