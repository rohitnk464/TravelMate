"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the map component with no SSR
const CityMap = dynamic(() => import("@/components/maps/CityMap"), {
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading interactive map...</p>
        </div>
    ),
    ssr: false,
});

export default function DashboardMap() {
    return (
        <div className="w-full h-full relative">
            <CityMap />
        </div>
    );
}
