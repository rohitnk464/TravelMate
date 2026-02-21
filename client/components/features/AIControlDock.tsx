"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Map, Utensils, Shield, Activity, Radio, Zap, ChevronRight, Phone, Bell, Mic, AlertTriangle } from "lucide-react";
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
        stats: []
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
        stats: []
    },
    {
        id: "safe",
        name: "Guardian",
        icon: Shield,
        status: "High Alert",
        desc: "Continuous safety monitoring & risk assessment.",
        action: "Scan Zone",
        color: "text-rose-400", // Changed to Rose for Safety/Danger context
        gradient: "from-rose-500/20 to-red-500/20",
        stats: []
    },
];

const AIControlDock = () => {
    const [activeTab, setActiveTab] = useState<AgentId>("orch");
    const [isSticky, setIsSticky] = useState(false);
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
        isSafetyMode,
        toggleSafetyMode
    } = useJourney();

    const searchParams = useSearchParams();
    const activeAgent = agents.find(a => a.id === activeTab) || agents[0];

    // Functional States for Guardian
    const [isRecording, setIsRecording] = useState(false);
    const [isSirenActive, setIsSirenActive] = useState(false);
    const [showFakeCall, setShowFakeCall] = useState(false);
    const [sosMode, setSosMode] = useState(false);

    // Siren Audio Reference (created dynamically)
    const [sirenAudio, setSirenAudio] = useState<HTMLAudioElement | null>(null);
    useEffect(() => {
        if (typeof window !== "undefined") {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg");
            audio.loop = true;
            setSirenAudio(audio);
        }
    }, []);

    const toggleSiren = () => {
        if (!sirenAudio) return;
        if (isSirenActive) {
            sirenAudio.pause();
            sirenAudio.currentTime = 0;
            setIsSirenActive(false);
        } else {
            sirenAudio.play().catch(e => console.error("Audio play failed:", e));
            setIsSirenActive(true);
        }
    };

    const toggleRecord = () => {
        setIsRecording(!isRecording);
    };

    const triggerSOS = () => {
        setSosMode(true);
        setTimeout(() => setSosMode(false), 5000); // Auto dismiss after 5 seconds
    };

    // Listen to scroll for sticky effect
    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleOptimizeRoute = async () => {
        setOrchestratorStatus({ ...orchestratorStatus, orchestrator: "Optimizing..." });
        setPendingAction("Plan Day");
        setTimeout(() => setOrchestratorStatus({ ...orchestratorStatus, orchestrator: "Route Optimized" }), 2000);
    };

    const handleCheckTraffic = async () => {
        setOrchestratorStatus({ ...orchestratorStatus, cityIntel: "Scanning..." });
        setTimeout(() => {
            setTrafficData({ level: Math.random() > 0.5 ? "Normal" : "Heavy", congestion: ["Beach Road"] });
            setOrchestratorStatus({ ...orchestratorStatus, cityIntel: "Traffic Updated" });
        }, 1500);
    };

    const handleFindSpots = async () => {
        setOrchestratorStatus({ ...orchestratorStatus, culinary: "Searching..." });
        setPendingAction("Find Food");
        setTimeout(() => {
            setRestaurantCount(Math.floor(Math.random() * 20) + 5);
            setOrchestratorStatus({ ...orchestratorStatus, culinary: "Spots Found" });
        }, 1500);
    };

    const handleSafetyAction = (action: string) => {
        console.log(`Safety Action: ${action}`);
        // Logic for fake call or siren would go here
    };

    return (
        <section className="relative z-30 -mt-20 mb-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
            >
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Navigation */}
                    <div className="flex items-center p-2 gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                        <div className="hidden md:flex items-center gap-2 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest border-r border-white/10 mr-2">
                            <Activity className="w-4 h-4" /> AI Core
                        </div>
                        {agents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => setActiveTab(agent.id)}
                                className={cn(
                                    "flex-1 relative px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 min-w-[120px]",
                                    activeTab === agent.id ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <agent.icon className={cn("w-4 h-4 transition-colors", activeTab === agent.id ? agent.color : "text-gray-500")} />
                                <span>{agent.name}</span>
                                {activeTab === agent.id && (
                                    <motion.div layoutId="activeDockTab" className={cn("absolute inset-0 rounded-xl bg-white/10 border border-white/5 -z-10")}>
                                        <div className={cn("absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-50", agent.color)} />
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {/* Left: Identity */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/10", activeAgent.color)}>
                                        <activeAgent.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{activeAgent.name}</h3>
                                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-1">
                                            <span className="relative flex h-2 w-2">
                                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", activeAgent.color.replace("text-", "bg-"))} />
                                                <span className={cn("relative inline-flex rounded-full h-2 w-2", activeAgent.color.replace("text-", "bg-"))} />
                                            </span>
                                            STATUS: <span className={activeAgent.color}>{activeAgent.status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{activeAgent.desc}</p>
                            </div>

                            {/* Middle & Right: Context Aware */}
                            {activeTab === "safe" ? (
                                <>
                                    {/* Safety Tools & Score */}
                                    <div className="col-span-2 flex flex-col gap-4">
                                        <div className="flex items-center justify-around bg-black/20 rounded-2xl p-4 border border-white/5">
                                            <div className="text-center">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Safe Score</div>
                                                <div className="text-2xl font-bold text-green-400 font-mono">{safetyScore || "98"}/100</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</div>
                                                <div className="text-2xl font-bold text-white font-mono">{isSafetyMode ? "Secured" : "Monitoring"}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 h-full">
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col justify-between group hover:bg-red-500/20 transition-colors cursor-pointer" onClick={toggleSafetyMode}>
                                                <div className="flex justify-between items-start">
                                                    <Shield className="w-6 h-6 text-red-500" />
                                                    <div className={cn("w-3 h-3 rounded-full", isSafetyMode ? "bg-red-500 animate-pulse" : "bg-gray-600")} />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-white">Safety Shield</div>
                                                    <div className="text-xs text-red-300">{isSafetyMode ? "ACTIVE PROTECTION" : "TAP TO ACTIVATE"}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => setShowFakeCall(true)} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 p-2 transition-colors">
                                                    <Phone className="w-5 h-5 text-blue-400" />
                                                    <span className="text-xs font-medium text-gray-300">Fake Call</span>
                                                </button>
                                                <button onClick={toggleSiren} className={cn("border rounded-xl flex flex-col items-center justify-center gap-2 p-2 transition-colors", isSirenActive ? "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50" : "bg-white/5 hover:bg-white/10 border-white/10")}>
                                                    <Bell className={cn("w-5 h-5", isSirenActive ? "text-yellow-400 animate-pulse" : "text-yellow-400")} />
                                                    <span className="text-xs font-medium text-gray-300">{isSirenActive ? "Stop Siren" : "Siren"}</span>
                                                </button>
                                                <button onClick={toggleRecord} className={cn("border rounded-xl flex flex-col items-center justify-center gap-2 p-2 transition-colors", isRecording ? "bg-green-500/20 hover:bg-green-500/30 border-green-500/50" : "bg-white/5 hover:bg-white/10 border-white/10")}>
                                                    <Mic className={cn("w-5 h-5", isRecording ? "text-green-400 animate-pulse" : "text-green-400")} />
                                                    <span className="text-xs font-medium text-gray-300">{isRecording ? "Recording..." : "Record"}</span>
                                                </button>
                                                <button onClick={triggerSOS} className={cn("border rounded-xl flex flex-col items-center justify-center gap-2 p-2 transition-all", sosMode ? "bg-red-600/40 border-red-500 scale-95" : "bg-red-600/20 hover:bg-red-600/40 border-red-500/50 animate-pulse")}>
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    <span className="text-xs font-bold text-red-400">{sosMode ? "ALERT SENT" : "SOS"}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Standard Stats & Action */}
                                    <div className="flex items-center justify-around bg-black/20 rounded-2xl p-4 border border-white/5">
                                        {activeAgent.id === "food" ? (
                                            <>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Nearby</div>
                                                    <div className="text-2xl font-bold text-white font-mono">{restaurantCount || "--"}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Rating</div>
                                                    <div className="text-2xl font-bold text-white font-mono">4.8+</div>
                                                </div>
                                            </>
                                        ) : activeAgent.id === "city" ? (
                                            <>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Traffic</div>
                                                    <div className="text-2xl font-bold text-white font-mono">{trafficData.level || "Good"}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Weather</div>
                                                    <div className="text-2xl font-bold text-white font-mono">Clear</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Battery</div>
                                                    <div className="text-2xl font-bold text-white font-mono">100%</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Context</div>
                                                    <div className="text-2xl font-bold text-white font-mono">Sync</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-center gap-3">
                                        <button
                                            onClick={() => {
                                                if (activeTab === "orch") handleOptimizeRoute();
                                                else if (activeTab === "city") handleCheckTraffic();
                                                else if (activeTab === "food") handleFindSpots();
                                            }}
                                            className={cn(
                                                "w-full py-4 rounded-xl font-bold text-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]",
                                                activeAgent.color.replace("text-", "bg-").replace("400", "400").replace("500", "400") // Fallback logic simplification
                                            )}
                                            style={{ backgroundColor: activeAgent.color === "text-purple-400" ? "#c084fc" : activeAgent.color === "text-blue-400" ? "#60a5fa" : "#fb923c" }}
                                        >
                                            <Zap className="w-4 h-4 fill-black" />
                                            {activeAgent.action}
                                        </button>
                                        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                                            <Radio className="w-3 h-3" /> Last synced: Just now
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Fake Call Overlay */}
            {showFakeCall && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="text-white text-center space-y-8 max-w-sm w-full">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-light">Dad (Mobile)</h2>
                            <p className="text-green-400 text-sm animate-pulse">Calling...</p>
                        </div>
                        <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto flex items-center justify-center">
                            <Phone className="w-16 h-16 text-white opacity-50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-12">
                            <button onClick={() => setShowFakeCall(false)} className="bg-red-500 hover:bg-red-600 text-white rounded-full py-4 px-8 font-bold flex justify-center items-center h-16 w-full">
                                Decline
                            </button>
                            <button onClick={() => setShowFakeCall(false)} className="bg-green-500 hover:bg-green-600 text-white rounded-full py-4 px-8 font-bold flex justify-center items-center h-16 w-full shadow-[0_0_20px_rgba(74,222,128,0.4)] animate-pulse">
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AIControlDock;
