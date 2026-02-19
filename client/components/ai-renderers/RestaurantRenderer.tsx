"use client";

import { Star, MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";

interface Restaurant {
    id: string;
    name: string;
    rating: number;
    cuisine: string;
    distance: string;
    lat: number;
    lng: number;
}

interface RestaurantRendererProps {
    data: {
        results: Restaurant[];
    };
    onLocationSelect: (loc: { lat: number; lng: number; name: string }) => void;
}

export default function RestaurantRenderer({ data, onLocationSelect }: RestaurantRendererProps) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
            {data.results.map((place, idx) => (
                <motion.div
                    key={place.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="min-w-[240px] bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                    onClick={() => onLocationSelect({ lat: place.lat, lng: place.lng, name: place.name })}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                            {place.name}
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-md text-xs font-bold">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            {place.rating}
                        </div>
                    </div>

                    <div className="text-sm text-gray-400 mb-3">{place.cuisine}</div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {place.distance} away
                        </div>
                        <button className="bg-primary/20 hover:bg-primary/30 text-primary p-1.5 rounded-full transition-colors">
                            <Navigation className="w-3 h-3" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
