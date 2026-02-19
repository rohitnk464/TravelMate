"use client";

import { motion } from "framer-motion";
import { Brain, MapPin, Utensils, Shield, Languages } from "lucide-react";

export const AgentStatus = () => {
    const agents = [
        { id: "lang", label: "Language", icon: Languages, status: "idle", color: "text-blue-400", bg: "bg-blue-500/10" },
        { id: "city", label: "City Intel", icon: MapPin, status: "active", color: "text-purple-400", bg: "bg-purple-500/10" },
        { id: "food", label: "Food Match", icon: Utensils, status: "idle", color: "text-orange-400", bg: "bg-orange-500/10" },
        { id: "safe", label: "Safety", icon: Shield, status: "monitoring", color: "text-green-400", bg: "bg-green-500/10" },
    ];

    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {agents.map((agent) => (
                <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 ${agent.bg}`}
                >
                    <agent.icon className={`w-3 h-3 ${agent.color}`} />
                    <span className={`text-xs font-medium ${agent.color}`}>{agent.label}</span>

                    {agent.status !== "idle" && (
                        <div className="flex gap-0.5">
                            <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className={`w-1 h-1 rounded-full ${agent.color.replace('text-', 'bg-')}`}
                            />
                            <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                className={`w-1 h-1 rounded-full ${agent.color.replace('text-', 'bg-')}`}
                            />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default AgentStatus;
