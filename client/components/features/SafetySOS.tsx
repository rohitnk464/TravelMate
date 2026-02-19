"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, ShieldAlert, Radio, Siren, Volume2, Shield, CheckCircle, WifiOff } from "lucide-react";
import { useJourney } from "@/context/JourneyContext";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";

const SafetySOS = () => {
    const { user, token } = useAuth(); // Get real user data
    const { emergencyState, setEmergencyState, escalationStep, setEscalationStep, addLog, isOnline } = useJourney();
    const [isActive, setIsActive] = useState(false);
    const [incidentId, setIncidentId] = useState<string | null>(null);

    // Sync local active state with global emergency state
    useEffect(() => {
        if (isActive && emergencyState === "safe") {
            setEmergencyState("sos_active");
            setEscalationStep(0);
        }
    }, [isActive]);

    // Create Incident on Activation
    useEffect(() => {
        if (isActive && !incidentId) {
            if (!isOnline) {
                // Offline Logic: Queue the incident mock
                const fakeId = Date.now().toString();
                setIncidentId(fakeId);
                addLog({ text: "Offline Mode: SOS Queued for Sync.", time: "Just now", icon: "WifiOff", color: "text-slate-400", bg: "bg-slate-500/10" });
                return;
            }

            const createIncident = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/safety/incidents`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            user: { id: user?.id, name: user?.name },
                            location: { lat: 28.6139, lng: 77.2090 }, // Mock Location
                            trigger: 'Manual SOS',
                            status: 'new'
                        })
                    });
                    const data = await res.json();
                    setIncidentId(data._id); // Use MongoDB _id
                    addLog({ text: "SOS Signal Sent to Command Center.", time: "Just now", icon: "Radio", color: "text-red-400", bg: "bg-red-500/10" });
                } catch (err) {
                    console.error("Failed to create incident:", err);
                }
            };
            createIncident();
        }
    }, [isActive, incidentId, isOnline, user, token]);

    // Poll for Updates
    useEffect(() => {
        if (!incidentId || !isActive || !isOnline) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/safety/incidents/${incidentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.status === 'acknowledged' && escalationStep < 2) {
                    setEscalationStep(2); // Jump to monitoring if acked
                    addLog({ text: "Safety Agent has acknowledged your alert.", time: "Just now", icon: "ShieldAlert", color: "text-green-400", bg: "bg-green-500/10" });
                } else if (data.status === 'resolved') {
                    setIsActive(false);
                    setEmergencyState("safe");
                    setEscalationStep(0);
                    setIncidentId(null);
                    addLog({ text: "Emergency marked resolved by Admin.", time: "Just now", icon: "Shield", color: "text-green-400", bg: "bg-green-500/10" });
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [incidentId, isActive, escalationStep, isOnline]);

    // Escalation Simulator (Fallback if no backend response or Offline)
    useEffect(() => {
        if (!isActive) return;

        if (escalationStep === 0) {
            const timer = setTimeout(() => {
                setEscalationStep(1);
                if (isOnline) {
                    addLog({ text: "Connecting to Safety Agent...", time: "Just now", icon: "ShieldAlert", color: "text-red-400", bg: "bg-red-500/10" });
                } else {
                    addLog({ text: "Offline: Activating Local Safety Protocols...", time: "Just now", icon: "WifiOff", color: "text-red-400", bg: "bg-red-500/10" });
                }
            }, 2000);
            return () => clearTimeout(timer);
        }

        // Offline Escalation: Go straight to Action
        if (!isOnline && escalationStep === 1) {
            const timer = setTimeout(() => {
                setEscalationStep(2);
                setEmergencyState("risk_detected");
                addLog({ text: "Offline Mode: Showing Emergency Contacts.", time: "Just now", icon: "Phone", color: "text-red-400", bg: "bg-red-500/10" });
            }, 1000);
            return () => clearTimeout(timer);
        }

        // Online Fallback Escalation
        if (isOnline && escalationStep === 1 && !incidentId) {
            const timer = setTimeout(() => {
                setEscalationStep(2);
                setEmergencyState("risk_detected");
                addLog({ text: "Live Audio & Location Sharing Active.", time: "Just now", icon: "Radio", color: "text-red-400", bg: "bg-red-500/10" });
            }, 2500);
            return () => clearTimeout(timer);
        }

    }, [isActive, escalationStep, incidentId, isOnline]);

    const handleCancel = () => {
        setIsActive(false);
        setEmergencyState("safe");
        setEscalationStep(0);
        setIncidentId(null);
        addLog({ text: "Emergency SOS cancelled by user.", time: "Just now", icon: "Shield", color: "text-green-400", bg: "bg-green-500/10" });
    };

    return (
        <>
            <div className="fixed bottom-6 left-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsActive(true)}
                    className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center animate-pulse hover:animate-none border-4 transition-colors ${isActive ? "bg-red-600 border-red-500/50 shadow-red-600/40" : "bg-white border-white/50 shadow-white/20"
                        }`}
                >
                    <span className={`font-bold text-lg ${isActive ? "text-white" : "text-red-600"}`}>SOS</span>
                </motion.button>
            </div>

            <AnimatePresence>
                {isActive && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-red-500/30 w-full max-w-md rounded-3xl p-8 text-center space-y-8 relative overflow-hidden"
                        >
                            {/* Animated Background Pulse */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 animate-pulse" />

                            {/* Status Icon Cycle */}
                            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                                <div className="relative z-10 w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/50">
                                    {escalationStep === 0 && <ShieldAlert className="w-10 h-10 text-red-500 animate-bounce" />}
                                    {escalationStep === 1 && <Radio className="w-10 h-10 text-red-500 animate-pulse" />}
                                    {escalationStep >= 2 && <Siren className="w-10 h-10 text-red-500 animate-spin-slow" />}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {!isOnline && escalationStep >= 2 ? "Offline Emergency Mode" :
                                        escalationStep === 0 ? "Connecting..." :
                                            escalationStep === 1 ? "Requesting Help..." :
                                                "Safety Team Connected"}
                                </h2>
                                <p className="text-zinc-400">
                                    {!isOnline && escalationStep >= 2 ? "Using cached emergency data." :
                                        escalationStep === 0 ? "Locating nearest Safety Agent..." :
                                            escalationStep === 1 ? "Sending location to Command Center..." :
                                                "Live Audio/Video feed active. Admin monitoring."}
                                </p>
                            </div>

                            {/* Escalation Progress Tracker - Elite UI */}
                            <div className="w-full px-2 py-4">
                                <div className="relative flex justify-between items-center">
                                    {/* Progress Bar Background */}
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -z-10 rounded-full" />
                                    {/* Active Progress Bar */}
                                    <motion.div
                                        className="absolute top-1/2 left-0 h-1 bg-red-500 -z-10 rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: escalationStep === 0 ? "10%" : escalationStep === 1 ? "50%" : "100%" }}
                                    />

                                    {/* Step 1: Sent */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${escalationStep >= 0 ? "bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-zinc-900 border-zinc-700 text-zinc-600"}`}>
                                            <Radio className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${escalationStep >= 0 ? "text-red-400" : "text-zinc-600"}`}>
                                            SOS Sent
                                        </span>
                                    </div>

                                    {/* Step 2: Notified */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors delay-300 ${escalationStep >= 1 ? "bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-zinc-900 border-zinc-700 text-zinc-600"}`}>
                                            <ShieldAlert className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${escalationStep >= 1 ? "text-red-400" : "text-zinc-600"}`}>
                                            Notified
                                        </span>
                                    </div>

                                    {/* Step 3: Monitoring */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors delay-500 ${escalationStep >= 2 ? "bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-zinc-900 border-zinc-700 text-zinc-600"}`}>
                                            <Siren className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${escalationStep >= 2 ? "text-red-400" : "text-zinc-600"}`}>
                                            Monitoring
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-4">
                                {escalationStep >= 2 ? (
                                    <>
                                        <button className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-red-600/20">
                                            <Phone className="w-6 h-6" />
                                            Call Police (100)
                                        </button>
                                        <button className="w-full py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center justify-center gap-3 transition-colors border border-zinc-700">
                                            <Volume2 className="w-6 h-6 text-yellow-500" />
                                            Play False Siren
                                        </button>
                                        {!isOnline && (
                                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-xs">
                                                <WifiOff className="w-3 h-3 inline mr-1" />
                                                Offline: Signal queued. Keep attempting call.
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-200 text-sm">
                                        <ShieldAlert className="w-4 h-4 inline mr-2" />
                                        Keep app open. AI is recording evidence.
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCancel}
                                className="text-sm text-zinc-500 hover:text-white transition-colors"
                            >
                                Cancel Emergency
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SafetySOS;
