"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Map, Shield, Users, ArrowRight, Search } from "lucide-react";

const tabs = [
    { id: "explore", label: "Explore", icon: Compass, color: "text-blue-400", bg: "from-blue-500/20 to-purple-500/20" },
    { id: "plan", label: "Plan Day", icon: Map, color: "text-purple-400", bg: "from-purple-500/20 to-pink-500/20" },
    { id: "safety", label: "Safety", icon: Shield, color: "text-rose-400", bg: "from-rose-500/20 to-orange-500/20" },
    { id: "guides", label: "Guides", icon: Users, color: "text-amber-400", bg: "from-amber-500/20 to-yellow-500/20" },
];

const FeatureTabs = () => {
    const [activeTab, setActiveTab] = useState("explore");

    return (
        <section className="relative z-20 -mt-20 container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Tabs Header */}
                <div className="flex border-b border-white/5 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all relative ${activeTab === tab.id ? "text-white" : "text-gray-400 hover:text-white/80"
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : "text-gray-500"}`} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.bg.replace('/20', '')}`}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 min-h-[200px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full text-center"
                        >
                            {activeTab === "explore" && (
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                        Discover Hidden Gems
                                    </h3>
                                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                                        Find curated spots rated by locals and verified for safety.
                                    </p>
                                    <button className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-sm transition-colors">
                                        Start Exploring <Navigation className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {activeTab === "plan" && (
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                        AI-Powered Itineraries
                                    </h3>
                                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                                        Tell us what you love, and we'll craft the perfect safe route.
                                    </p>
                                    <div className="flex max-w-sm mx-auto gap-2">
                                        <input
                                            type="text"
                                            placeholder="E.g., Art museums in Paris..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                        <button className="p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "safety" && (
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400">
                                        Guardian Safety Mode
                                    </h3>
                                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                                        Real-time risk monitoring, emergency SOS, and safe zone navigation.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-bold">
                                            <Shield className="w-3 h-3" /> Live Monitor
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-xs font-bold">
                                            <Map className="w-3 h-3" /> Safe Routes
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "guides" && (
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">
                                        Book Local Experts
                                    </h3>
                                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                                        Connect with verified guides who know the city inside out.
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md mx-auto">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-600" />
                                                <div className="text-left">
                                                    <div className="h-2 w-16 bg-white/20 rounded mb-1" />
                                                    <div className="h-1.5 w-10 bg-white/10 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

// Start Exploring icon was missing
function Navigation(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
    )
}

export default FeatureTabs;
