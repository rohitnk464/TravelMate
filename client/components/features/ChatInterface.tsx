"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MapPin, Clock, Shield, X, ChevronRight, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useJourney } from "@/context/JourneyContext";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { CITY_COORDINATES } from "@/lib/constants";
import { API_BASE_URL } from "@/lib/config";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    type?: "text" | "itinerary" | "thinking";
    data?: any;
}

export default function ChatInterface() {
    const {
        activeModule,
        setTimeline,
        setMapMarkers,
        setRoutePolyline,
        mapMarkers,
        isSafetyMode,
        toggleSafetyMode,
        pendingAction,
        setPendingAction,
        orchestratorStatus,
        setOrchestratorStatus,
        selectedCity,
        selectedMarkerId,
        setSelectedMarkerId,
        selectedCityCoordinates,
        setSelectedCityCoordinates
    } = useJourney();

    const searchParams = useSearchParams();
    // Prioritize selectedCity from context, then URL, then default
    const targetCity = selectedCity || searchParams.get("location") || "Bengaluru";

    // Synchronize coordinates if city changes and we have them in constants
    useEffect(() => {
        if (targetCity && !selectedCityCoordinates) {
            const normalizedTarget = targetCity.toLowerCase();
            const cityKey = Object.keys(CITY_COORDINATES).find(key =>
                normalizedTarget.includes(key.toLowerCase()) ||
                key.toLowerCase().includes(normalizedTarget)
            );
            if (cityKey && setSelectedCityCoordinates) {
                setSelectedCityCoordinates(CITY_COORDINATES[cityKey]);
            }
        }
    }, [targetCity, selectedCityCoordinates, setSelectedCityCoordinates]);

    const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm your AI Travel Orchestrator. Where would you like to go today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Scroll to selected timeline item
    useEffect(() => {
        if (selectedMarkerId && itemRefs.current[selectedMarkerId]) {
            itemRefs.current[selectedMarkerId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedMarkerId]);

    // Helper for unique IDs
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const handleOptimizeRoute = async () => {
        const targetCity = selectedCity || searchParams.get("location") || "Bengaluru";
        setIsLoading(true);
        const thinkingId = generateId();
        setMessages(prev => [...prev, {
            id: thinkingId,
            role: "assistant",
            content: `Generating the perfect day plan for ${targetCity}... 🗓️`,
            timestamp: new Date(),
            type: "thinking"
        }]);

        try {
            let lat, lon;
            const normalizedTarget = targetCity.toLowerCase();
            const cityKey = Object.keys(CITY_COORDINATES).find(key =>
                normalizedTarget.includes(key.toLowerCase()) ||
                key.toLowerCase().includes(normalizedTarget)
            );

            if (cityKey) {
                [lat, lon] = CITY_COORDINATES[cityKey];
                setSelectedCityCoordinates([lat, lon]);
            } else {
                // Fetch coordinates if not in constant
                try {
                    const geoRes = await fetch(`${API_BASE_URL}/api/openmap/geocode?city=${encodeURIComponent(targetCity)}`);
                    const geoData = await geoRes.json();
                    if (geoData && geoData.lat) {
                        lat = parseFloat(geoData.lat);
                        lon = parseFloat(geoData.lon);
                        setSelectedCityCoordinates([lat, lon]);
                    }
                } catch (e) {
                    console.error("Geocode failed", e);
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/ai-planner/planner`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `Plan a perfect one-day itinerary for a tourist in ${targetCity}. Include a mix of landmarks, culture, and relaxation.`,
                    location: targetCity,
                    safetyMode: isSafetyMode,
                    coordinates: lat && lon ? { lat, lon } : null
                })
            });

            if (!response.ok) throw new Error("Failed to fetch plan from AI");

            const data = await response.json();

            setMessages(prev => prev.filter(m => m.id !== thinkingId));

            // Process timeline with consistent IDs
            const processedTimeline = (data.timeline || []).map((item: any) => ({
                ...item,
                id: item.place_id || item.id || `stop-${generateId()}`,
                time: item.time || "Flexible"
            }));

            // Update map markers
            const newMarkers = processedTimeline.map((item: any) => ({
                id: item.id,
                lat: item.lat,
                lng: item.lng || item.lon,
                label: item.title,
                type: item.type === "food" ? "food" : "attraction",
                details: {
                    address: item.description,
                    rating: item.safetyScore ? `KB Safety Score: ${item.safetyScore}/10` : "Popular Spot"
                }
            }));

            setTimeline(processedTimeline);
            setMapMarkers(newMarkers);

            if (data.routeGeometry) {
                setRoutePolyline(data.routeGeometry);
            } else if (newMarkers.length >= 2) {
                const coordinates = newMarkers.map((m: any) => [m.lng, m.lat]);
                const routeRes = await fetch(`${API_BASE_URL}/api/openmap/trip`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ coordinates })
                });
                const routeData = await routeRes.json();
                if (routeData.geometry) {
                    setRoutePolyline(routeData.geometry);
                }
            }

            const aiMsg: Message = {
                id: generateId(),
                role: "assistant",
                content: data.summary || `Here is your optimized itinerary for ${targetCity}!`,
                timestamp: new Date(),
                type: processedTimeline.length > 0 ? "itinerary" : "text",
                data: { ...data, timeline: processedTimeline }
            };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== thinkingId));
            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: "I'm having trouble connecting to the planner service. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            setPendingAction(null);
            setOrchestratorStatus({ ...orchestratorStatus, orchestrator: "Plan Ready" });
        }
    };


    const handleFindFood = async () => {
        setOrchestratorStatus({ ...orchestratorStatus, culinary: "Searching..." });

        const userMsgId = generateId();
        setMessages(prev => [...prev, {
            id: userMsgId,
            role: "user",
            content: "Find food spots nearby 🍔",
            timestamp: new Date()
        }]);

        setIsLoading(true);
        const thinkingId = generateId();
        setMessages(prev => [...prev, {
            id: thinkingId,
            role: "assistant",
            content: "Scouting for top-rated dining spots... 🥘",
            timestamp: new Date(),
            type: "thinking"
        }]);

        try {
            let lat, lon;
            if (mapMarkers && mapMarkers.length > 0) {
                const lastMarker = mapMarkers[mapMarkers.length - 1];
                lat = lastMarker.lat;
                lon = lastMarker.lng;
            } else {
                const geoRes = await fetch(`${API_BASE_URL}/api/openmap/geocode?city=${encodeURIComponent(targetCity)}`);
                const geoData = await geoRes.json();
                if (geoData && geoData.lat) {
                    lat = parseFloat(geoData.lat);
                    lon = parseFloat(geoData.lon);
                }
            }

            if (!lat || !lon) throw new Error("Could not determine location");

            const response = await fetch(`${API_BASE_URL}/api/openmap/places`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon, type: 'restaurant', radius: 10000 })
            });

            const data = await response.json();

            setMessages(prev => prev.filter(m => m.id !== thinkingId));

            if (data.places && data.places.length > 0) {
                const foodItems = data.places.slice(0, 10).map((p: any) => ({
                    id: p.id || `food-${generateId()}`,
                    title: p.name || "Restaurant",
                    lat: p.lat,
                    lng: p.lon,
                    description: p.tags?.cuisine ? `${p.tags.cuisine} Cuisine` : "Dining Spot",
                    time: "Nearby",
                    type: "food",
                    safetyScore: 9 // Mock high score
                }));

                // Convert to markers
                const foodMarkers = foodItems.map((item: any) => ({
                    id: item.id,
                    lat: item.lat,
                    lng: item.lng,
                    label: item.title,
                    type: "food",
                    details: {
                        cuisine: item.description,
                        address: "Just now",
                        rating: 4.5
                    }
                }));

                setMapMarkers([...mapMarkers, ...foodMarkers]);

                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: "assistant",
                    content: `Found ${data.places.length} food spots! Showing the best ones. 🍜`,
                    timestamp: new Date(),
                    type: "itinerary",
                    data: { timeline: foodItems } // Reuse timeline display for list
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: "assistant",
                    content: "No food spots found nearby.",
                    timestamp: new Date()
                }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== thinkingId));
            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: "Failed to find food spots. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            setPendingAction(null);
            setOrchestratorStatus({ ...orchestratorStatus, culinary: "Spots Found" });
        }
    };

    const handleSafeSpots = async () => {
        setOrchestratorStatus({ ...orchestratorStatus, guardian: "Scanning..." });

        const userMsgId = generateId();
        setMessages(prev => [...prev, {
            id: userMsgId,
            role: "user",
            content: "Show me safe areas and emergency services 🛡️",
            timestamp: new Date()
        }]);

        setIsLoading(true);
        const thinkingId = generateId();
        setMessages(prev => [...prev, {
            id: thinkingId,
            role: "assistant",
            content: "Locating nearest police stations and hospitals... 🚑",
            timestamp: new Date(),
            type: "thinking"
        }]);

        try {
            let lat, lon;
            if (mapMarkers && mapMarkers.length > 0) {
                const lastMarker = mapMarkers[mapMarkers.length - 1];
                lat = lastMarker.lat;
                lon = lastMarker.lng;
            } else {
                const geoRes = await fetch(`${API_BASE_URL}/api/openmap/geocode?city=${encodeURIComponent(targetCity)}`);
                const geoData = await geoRes.json();
                if (geoData && geoData.lat) {
                    lat = parseFloat(geoData.lat);
                    lon = parseFloat(geoData.lon);
                }
            }

            if (!lat || !lon) throw new Error("Could not determine location");

            const [policeRes, hospitalRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/openmap/places`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat, lon, type: 'police', radius: 5000 })
                }),
                fetch(`${API_BASE_URL}/api/openmap/places`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat, lon, type: 'hospital', radius: 5000 })
                })
            ]);

            const policeData = await policeRes.json();
            const hospitalData = await hospitalRes.json();

            const safeItems = [
                ...(policeData.places || []).map((p: any) => ({
                    id: p.id, title: p.name || "Police Station", lat: p.lat, lng: p.lon, type: "police", description: "Emergency Services", time: "24/7"
                })),
                ...(hospitalData.places || []).map((p: any) => ({
                    id: p.id, title: p.name || "Hospital", lat: p.lat, lng: p.lon, type: "hospital", description: "Medical Center", time: "24/7"
                }))
            ].slice(0, 15);

            setMessages(prev => prev.filter(m => m.id !== thinkingId));

            if (safeItems.length > 0) {
                const safeMarkers = safeItems.map((item: any) => ({
                    id: item.id, lat: item.lat, lng: item.lng, label: item.title, type: item.type,
                    details: { address: "Emergency Service - High Security", rating: 5 }
                }));

                setMapMarkers([...mapMarkers, ...safeMarkers]);
                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: "assistant",
                    content: `Found ${safeItems.length} safe spots (Police & Hospitals). 🛡️`,
                    timestamp: new Date(),
                    type: "itinerary",
                    data: { timeline: safeItems }
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: "assistant",
                    content: "No emergency services found in the immediate vicinity.",
                    timestamp: new Date()
                }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== thinkingId));
            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: "Could not fetch safety data.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            setPendingAction(null);
            setOrchestratorStatus({ ...orchestratorStatus, guardian: "High Alert" });
        }
    };

    const handleTranslateHelp = async () => {
        setPendingAction("Translate Help");

        const userMsgId = generateId();
        setMessages(prev => [...prev, {
            id: userMsgId,
            role: "user",
            content: "I need translation help 🗣️",
            timestamp: new Date()
        }]);

        setIsLoading(true);

        // Simulate AI response for translation mode
        setTimeout(() => {
            setIsLoading(false);
            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: "I'm listening! What phrase do you need translated? (e.g., 'Where is the bathroom?' in Spanish)",
                timestamp: new Date()
            }]);
        }, 1000);
    };

    const handleFindHotels = async () => {
        setOrchestratorStatus({ ...orchestratorStatus, accommodation: "Searching..." });

        const userMsgId = generateId();
        setMessages(prev => [...prev, {
            id: userMsgId,
            role: "user",
            content: "Find hotels nearby 🏨",
            timestamp: new Date()
        }]);

        setIsLoading(true);
        const thinkingId = generateId();
        setMessages(prev => [...prev, {
            id: thinkingId,
            role: "assistant",
            content: "Scanning for top-rated hotels and stays... 🛏️",
            timestamp: new Date(),
            type: "thinking"
        }]);

        try {
            let lat, lon;
            if (mapMarkers && mapMarkers.length > 0) {
                const lastMarker = mapMarkers[mapMarkers.length - 1];
                lat = lastMarker.lat;
                lon = lastMarker.lng;
            } else {
                const geoRes = await fetch(`${API_BASE_URL}/api/openmap/geocode?city=${encodeURIComponent(targetCity)}`);
                const geoData = await geoRes.json();
                if (geoData && geoData.lat) {
                    lat = parseFloat(geoData.lat);
                    lon = parseFloat(geoData.lon);
                }
            }

            if (!lat || !lon) throw new Error("Could not determine location");

            const response = await fetch(`${API_BASE_URL}/api/openmap/places`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon, type: 'hotel', radius: 10000 })
            });

            const data = await response.json();

            setMessages(prev => prev.filter(m => m.id !== thinkingId));

            if (data.places && data.places.length > 0) {
                const hotelItems = data.places.slice(0, 10).map((p: any) => ({
                    id: p.id || `hotel-${generateId()}`,
                    title: p.name || "Hotel",
                    lat: p.lat,
                    lng: p.lon,
                    description: "Comfortable Stay",
                    time: "Nearby",
                    type: "hotel",
                    safetyScore: 9.5
                }));

                const hotelMarkers = hotelItems.map((item: any) => ({
                    id: item.id,
                    lat: item.lat,
                    lng: item.lng,
                    label: item.title,
                    type: "hotel",
                    details: {
                        address: "Just now",
                        rating: 4.8
                    }
                }));

                setMapMarkers([...mapMarkers, ...hotelMarkers]);

                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: "assistant",
                    content: `Found ${data.places.length} hotels nearby! 🏨`,
                    timestamp: new Date(),
                    type: "itinerary",
                    data: { timeline: hotelItems }
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: generateId(),
                    role: "assistant",
                    content: "No hotels found nearby.",
                    timestamp: new Date()
                }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== thinkingId));
            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: "Failed to find hotels. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            setPendingAction(null);
            setOrchestratorStatus({ ...orchestratorStatus, accommodation: "Available" });
        }
    };

    useEffect(() => {
        if (pendingAction === "Plan Day") {
            handleOptimizeRoute();
        } else if (pendingAction === "Find Food") {
            handleFindFood();
        } else if (pendingAction === "Safe Areas") {
            handleSafeSpots();
        } else if (pendingAction === "Translate Help") {
            handleTranslateHelp();
        } else if (pendingAction === "Find Hotels") {
            handleFindHotels();
        }
    }, [pendingAction]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: generateId(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Add thinking indicator
        const thinkingId = "thinking-" + generateId();
        setMessages(prev => [...prev, {
            id: thinkingId,
            role: "assistant",
            content: "Analyzing preferences and checking live data...",
            timestamp: new Date(),
            type: "thinking"
        }]);

        try {
            const locationContext = selectedCity || "Goa";

            // Resolve coordinates
            let lat, lon;
            const normalizedTarget = locationContext.toLowerCase();
            const cityKey = Object.keys(CITY_COORDINATES).find(key =>
                normalizedTarget.includes(key.toLowerCase()) ||
                key.toLowerCase().includes(normalizedTarget)
            );
            if (cityKey) {
                [lat, lon] = CITY_COORDINATES[cityKey];
                setSelectedCityCoordinates([lat, lon]);
            } else {
                try {
                    const geoRes = await fetch(`${API_BASE_URL}/api/openmap/geocode?city=${encodeURIComponent(locationContext)}`);
                    const geoData = await geoRes.json();
                    if (geoData && geoData.lat) {
                        lat = parseFloat(geoData.lat);
                        lon = parseFloat(geoData.lon);
                        setSelectedCityCoordinates([lat, lon]);
                    }
                } catch (e) {
                    console.error("Geocode failed", e);
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/ai-planner/planner`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: userMsg.content,
                    location: locationContext,
                    safetyMode: isSafetyMode,
                    coordinates: lat && lon ? { lat, lon } : null
                })
            });

            if (!response.ok) throw new Error("Failed to fetch plan");

            const data = await response.json();

            setMessages(prev => prev.filter(m => m.id !== thinkingId));

            const aiMsg: Message = {
                id: generateId(),
                role: "assistant",
                content: data.summary || "Here is your suggested itinerary.",
                timestamp: new Date(),
                type: data.timeline ? "itinerary" : "text",
                data: data
            };

            setMessages(prev => [...prev, aiMsg]);

            if (data.timeline) {
                setTimeline(data.timeline);
                setMapMarkers(data.timeline.map((item: any) => ({
                    id: item.place_id || generateId(),
                    lat: item.lat,
                    lng: item.lng || item.lon, // Support both lng and lon
                    label: item.title,
                    type: item.type === "food" ? "food" : "attraction"
                })));
                // Use routeGeometry (GeoJSON from OSRM) instead of routePolyline
                if (data.routeGeometry) {
                    setRoutePolyline(data.routeGeometry);
                }
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== thinkingId));
            setMessages(prev => [...prev, {
                id: generateId(),
                role: "assistant",
                content: "I'm having trouble connecting to the travel network. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl border-l border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-semibold text-sm text-white">AI Orchestrator Active</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={toggleSafetyMode}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors border",
                            isSafetyMode
                                ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                        )}
                        title="Toggle Guardian Safety Mode"
                    >
                        <Shield className={cn("w-3 h-3", isSafetyMode && "fill-current")} />
                        {isSafetyMode ? "Guardian ON" : "Guardian OFF"}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex flex-col max-w-[85%]",
                            msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        <div
                            className={cn(
                                "p-3 rounded-2xl text-sm shadow-lg",
                                msg.role === "user"
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                                    : cn(
                                        "bg-white/10 border border-white/20 rounded-bl-none text-white backdrop-blur-sm",
                                        msg.type === "thinking" && "animate-pulse"
                                    )
                            )}
                        >
                            {msg.content}
                        </div>

                        {/* Itinerary Card Rendering */}
                        {msg.type === "itinerary" && msg.data?.timeline && (
                            <div className="mt-2 w-full bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-lg">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">Suggested Timeline</h4>
                                <div className="space-y-3">
                                    {msg.data.timeline.map((step: any, idx: number) => (
                                        <div
                                            key={idx}
                                            ref={(el) => { if (step.id) itemRefs.current[step.id] = el; }}
                                            onClick={() => step.id && setSelectedMarkerId(step.id)}
                                            className={cn(
                                                "flex gap-3 relative cursor-pointer p-2 rounded-lg transition-all border border-transparent",
                                                selectedMarkerId === step.id ? "bg-blue-500/20 border-blue-500/50 shadow-sm" : "hover:bg-white/5"
                                            )}
                                        >
                                            {/* Connector Line */}
                                            {idx !== msg.data.timeline.length - 1 && (
                                                <div className="absolute top-8 left-[19px] bottom-[-16px] w-0.5 bg-white/10" />
                                            )}

                                            <div className={cn(
                                                "mt-1 min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors",
                                                selectedMarkerId === step.id ? "bg-blue-500 text-white border-blue-400" : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                            )}>
                                                {idx + 1}
                                            </div>

                                            <div className="flex-1 pb-1">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-bold text-sm text-white">{step.title}</h5>
                                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                                                        {step.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{step.description}</p>

                                                <div className="flex items-center gap-2 mt-2">
                                                    {step.safetyScore && (
                                                        <span className={cn(
                                                            "text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1",
                                                            step.safetyScore > 8 ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                                        )}>
                                                            <Shield className="w-3 h-3" /> {step.safetyScore}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        setOrchestratorStatus({ ...orchestratorStatus, orchestrator: "Navigating" });
                                        setMessages(prev => [...prev, {
                                            id: Date.now().toString(),
                                            role: "assistant",
                                            content: "Starting your journey! I'll monitor traffic and safety for you. 🚗",
                                            timestamp: new Date()
                                        }]);
                                    }}
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Start Journey
                                </button>
                            </div>
                        )}

                        <span className="text-[10px] text-gray-500 mt-1 px-1 min-h-[15px]">
                            {mounted && msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                {["Plan Day", "Find Food", "Find Hotels", "Safe Areas", "Translate Help"].map((chip) => (
                    <button
                        key={chip}
                        onClick={() => {
                            if (chip === "Plan Day") setPendingAction("Plan Day");
                            else if (chip === "Find Food") setPendingAction("Find Food");
                            else if (chip === "Find Hotels") setPendingAction("Find Hotels");
                            else if (chip === "Safe Areas") setPendingAction("Safe Areas");
                            else if (chip === "Translate Help") setPendingAction("Translate Help");
                            else setInput(chip);
                        }}
                        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-blue-200 hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors flex items-center gap-1.5 backdrop-blur-sm"
                    >
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        {chip}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/50 border-t border-white/10">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Plan a focused day..."
                        disabled={isLoading}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "absolute right-2 p-2 rounded-full transition-all",
                            input.trim() && !isLoading
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg"
                                : "bg-white/5 text-gray-600 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <Sparkles className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
