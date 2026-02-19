"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

type JourneyStep = "arrival" | "hotel" | "food" | "explore" | "return";

interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    label: string;
    type: "food" | "attraction" | "safety" | "police" | "hospital" | "hotel" | "other";
    details?: {
        cuisine?: string;
        address?: string;
        hours?: string;
        website?: string;
        phone?: string;
        rating?: number;
    };
}

interface OrchestratorStatus {
    orchestrator: string;
    cityIntel: string;
    culinary: string;
    guardian: string;
    accommodation?: string;
}

interface TrafficData {
    level: string;
    congestion: string[];
}

interface JourneyContextType {
    currentStep: JourneyStep;
    isSafetyMode: boolean;
    toggleSafetyMode: () => void;
    advanceStep: (step: JourneyStep) => void;
    agentLogs: any[];
    emergencyState: "safe" | "monitoring" | "risk_detected" | "sos_active";
    setEmergencyState: (state: "safe" | "monitoring" | "risk_detected" | "sos_active") => void;
    escalationStep: number;
    setEscalationStep: (step: number) => void;
    addLog: (log: any) => void;
    isOnline: boolean;
    isLowConnectivity: boolean;
    mapMarkers: MapMarker[];
    setMapMarkers: (markers: MapMarker[]) => void;
    selectedMarkerId: string | null;
    setSelectedMarkerId: (id: string | null) => void;
    pendingAction: string | null;
    setPendingAction: (action: string | null) => void;
    // Orchestrator state
    orchestratorStatus: OrchestratorStatus;
    setOrchestratorStatus: (status: OrchestratorStatus) => void;
    trafficData: TrafficData;
    setTrafficData: (data: TrafficData) => void;
    restaurantCount: number;
    setRestaurantCount: (count: number) => void;
    safetyScore: number;
    setSafetyScore: (score: number) => void;
    // AI Planner State
    timeline: any[];
    setTimeline: (timeline: any[]) => void;
    routePolyline: string | { type: string; coordinates: number[][] } | null;
    setRoutePolyline: (polyline: string | { type: string; coordinates: number[][] } | null) => void;
    activeModule: "orch" | "city" | "food" | "safe";
    setActiveModule: (module: "orch" | "city" | "food" | "safe") => void;
    selectedCity: string | null;
    setSelectedCity: (city: string | null) => void;
    selectedCityCoordinates: [number, number] | null;
    setSelectedCityCoordinates: (coords: [number, number] | null) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider = ({ children }: { children: ReactNode }) => {
    const [currentStep, setCurrentStep] = useState<JourneyStep>("arrival");
    const [isSafetyMode, setIsSafetyMode] = useState(false);
    const [agentLogs, setAgentLogs] = useState<any[]>([]);
    const [emergencyState, setEmergencyState] = useState<"safe" | "monitoring" | "risk_detected" | "sos_active">("safe");
    const [escalationStep, setEscalationStep] = useState(0);
    const { isOnline, isLowConnectivity } = useNetworkStatus();
    const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    // Orchestrator state
    const [orchestratorStatus, setOrchestratorStatus] = useState<OrchestratorStatus>({
        orchestrator: "Active",
        cityIntel: "Monitoring",
        culinary: "Standby",
        guardian: "High Alert",
        accommodation: "Standby"
    });
    const [trafficData, setTrafficData] = useState<TrafficData>({
        level: "Normal",
        congestion: []
    });
    const [restaurantCount, setRestaurantCount] = useState(0);
    const [safetyScore, setSafetyScore] = useState(8.7);

    // AI Planner State
    const [timeline, setTimeline] = useState<any[]>([]);
    const [routePolyline, setRoutePolyline] = useState<string | { type: string; coordinates: number[][] } | null>(null);
    const [activeModule, setActiveModule] = useState<"orch" | "city" | "food" | "safe">("orch");
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCityCoordinates, setSelectedCityCoordinates] = useState<[number, number] | null>(null);

    // Persistence
    useEffect(() => {
        const savedMode = localStorage.getItem("isSafetyMode");
        if (savedMode) setIsSafetyMode(JSON.parse(savedMode));
    }, []);

    const addLog = (log: any) => {
        setAgentLogs(prev => [{ ...log, id: Date.now() }, ...prev]);
    };

    // Auto-log network changes
    useEffect(() => {
        if (!isOnline) {
            addLog({ text: "Network lost. Switched to Offline Safety Mode.", time: "Just now", icon: "WifiOff", color: "text-slate-400", bg: "bg-slate-500/10" });
        } else if (isOnline && agentLogs.some(l => l.text.includes("Network lost"))) {
            addLog({ text: "Network restored. Syncing safety data...", time: "Just now", icon: "Wifi", color: "text-green-400", bg: "bg-green-500/10" });
        }
    }, [isOnline]);

    const toggleSafetyMode = () => {
        setIsSafetyMode(prev => {
            const newValue = !prev;
            localStorage.setItem("isSafetyMode", JSON.stringify(newValue));
            addLog({
                text: newValue ? "Women Safety Mode Enabled. System optimizing for protection." : "Safety Mode Disabled.",
                time: "Just now",
                icon: newValue ? "ShieldCheck" : "Shield",
                color: newValue ? "text-pink-400" : "text-gray-400",
                bg: newValue ? "bg-pink-500/10" : "bg-gray-500/10"
            });
            return newValue;
        });
    };

    const advanceStep = (step: JourneyStep) => setCurrentStep(step);

    // Safety Monitoring Simulation
    useEffect(() => {
        if (!isSafetyMode) return;

        const safetyInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                const msgs = [
                    "Safety Agent: Monitoring route lighting levels...",
                    "Safety Agent: Verified driver identity for upcoming transport.",
                    "Safety Agent: scanning local news for disturbances..."
                ];
                addLog({
                    text: msgs[Math.floor(Math.random() * msgs.length)],
                    time: "Just now",
                    icon: "ShieldCheck",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10"
                });
            }
        }, 12000);

        return () => clearInterval(safetyInterval);
    }, [isSafetyMode]);

    // Mock Agent Simulation
    useEffect(() => {
        if (currentStep === "arrival") {
            const timer = setTimeout(() => {
                addLog({ text: "Arrival verified. Checking in to hotel...", time: "Just now", icon: "CheckCircle", color: "text-green-400", bg: "bg-green-500/10" });
                advanceStep("hotel");
            }, 8000);
            return () => clearTimeout(timer);
        }

        if (currentStep === "hotel") {
            const timer = setTimeout(() => {
                addLog({ text: "Check-in complete. Finding food options nearby...", time: "Just now", icon: "Utensils", color: "text-orange-400", bg: "bg-orange-500/10" });
                advanceStep("food");
            }, 16000);
            return () => clearTimeout(timer);
        }

        if (currentStep === "food") {
            const timer = setTimeout(() => {
                addLog({ text: "Lunch finished. Suggesting exploration route...", time: "Just now", icon: "Map", color: "text-blue-400", bg: "bg-blue-500/10" });
                advanceStep("explore");
            }, 24000);
            return () => clearTimeout(timer);
        }

    }, [currentStep]);

    return (
        <JourneyContext.Provider value={{
            currentStep, isSafetyMode, toggleSafetyMode, advanceStep, agentLogs,
            emergencyState, setEmergencyState, escalationStep, setEscalationStep, addLog,
            isOnline, isLowConnectivity, mapMarkers, setMapMarkers, pendingAction, setPendingAction,
            orchestratorStatus, setOrchestratorStatus, trafficData, setTrafficData,
            restaurantCount, setRestaurantCount, safetyScore, setSafetyScore,
            timeline, setTimeline, routePolyline, setRoutePolyline, activeModule, setActiveModule,
            selectedCity, setSelectedCity, selectedMarkerId, setSelectedMarkerId,
            selectedCityCoordinates, setSelectedCityCoordinates
        }}>
            {children}
        </JourneyContext.Provider>
    );
};

export const useJourney = () => {
    const context = useContext(JourneyContext);
    if (!context) throw new Error("useJourney must be used within a JourneyProvider");
    return context;
};
