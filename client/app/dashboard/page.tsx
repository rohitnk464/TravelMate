"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardMap from "@/components/dashboard/Map";
import DashboardAIPanel from "@/components/dashboard/AIPanel";
import JourneyTimeline from "@/components/features/JourneyTimeline";
import ContextualPanel from "@/components/features/ContextualPanel";
import { useJourney } from "@/context/JourneyContext";
import { Menu } from "lucide-react";

import { Suspense } from "react";

function DashboardContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentStep, setSelectedCity, setSelectedCityCoordinates } = useJourney();
    const searchParams = useSearchParams();

    // Read location from URL and set it in context
    useEffect(() => {
        const location = searchParams.get('location');
        if (location && setSelectedCity) {
            setSelectedCity(location);

            // Try to resolve coordinates if not already set
            const resolveCoords = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/openmap/geocode?city=${encodeURIComponent(location)}`);
                    const data = await response.json();
                    if (data && data.lat && setSelectedCityCoordinates) {
                        setSelectedCityCoordinates([parseFloat(data.lat), parseFloat(data.lon)]);
                    }
                } catch (error) {
                    console.error("Failed to geocode city in dashboard:", error);
                }
            };

            resolveCoords();
        }
    }, [searchParams, setSelectedCity, setSelectedCityCoordinates]);

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Mobile Sidebar Toggle */}
            <button
                className="md:hidden absolute top-4 left-4 z-50 p-2 bg-background/50 backdrop-blur-md rounded-lg border border-white/10"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open Sidebar</span>
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area - Split View */}
            <main className="flex-1 flex flex-col md:flex-row relative">
                {/* Left: Map Area & Journey UI (60% width on desktop) */}
                <div className="w-full h-1/2 md:h-full md:w-[60%] relative flex flex-col">

                    {/* Journey Timeline (Top Overlay) */}
                    <div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none md:pointer-events-auto">
                        <JourneyTimeline currentStep={currentStep} />
                    </div>

                    {/* Map */}
                    <div className="flex-1 relative z-0">
                        <DashboardMap />
                    </div>

                    {/* Contextual Actions removed as per user request */}
                </div>

                {/* Right: AI Panel (40% width on desktop) */}
                <div className="w-full h-1/2 md:h-full md:w-[40%] border-l border-white/10 bg-background/95 backdrop-blur-xl relative z-30">
                    <DashboardAIPanel />
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-background text-white">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
