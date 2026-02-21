"use client";

import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { useJourney } from "@/context/JourneyContext";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop";

const destinationsMock = [
    {
        _id: 1,
        name: "Kyoto, Japan",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop",
        tags: ["Culture", "Safety", "Food"],
    },
    {
        _id: 2,
        name: "Santorini, Greece",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2938&auto=format&fit=crop",
        tags: ["Romance", "Views", "Relax"],
    },
    {
        _id: 3,
        name: "Reykjavik, Iceland",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2659&auto=format&fit=crop",
        tags: ["Adventure", "Nature", "Safety"],
    },
];

const Destinations = () => {
    const { isSafetyMode } = useJourney();
    const [destinations, setDestinations] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/places`)
            .then(res => res.json())
            .then(data => {
                // If no data in DB, use fallback mock data for demo
                if (data && data.length > 0) setDestinations(data);
                else setDestinations(destinationsMock);
            })
            .catch(err => {
                console.error("Failed to fetch places:", err);
                setDestinations(destinationsMock);
            });
    }, []);

    return (
        <section className="py-10 md:py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Featured Destinations
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Explore hand-picked destinations with verified safety ratings and 24/7 local support.
                    </p>
                    {isSafetyMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-bold"
                        >
                            <MapPin className="w-4 h-4" />
                            Safety Mode: Showing High-Visibility, Low-Risk Routes
                        </motion.div>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {destinations.map((dest, index) => (
                        <Link key={dest._id || dest.id || index} href={`/dashboard?location=${dest.location || dest.name}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className={`group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer ${isSafetyMode ? "border-2 border-pink-500/30" : ""}`}
                            >
                                <img
                                    src={dest.image || DEFAULT_IMAGE}
                                    alt={dest.name || "Destination"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {isSafetyMode && (
                                    <div className="absolute top-4 right-4 bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                                        Safety Optimized
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl font-bold">{dest.name}</h3>
                                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-semibold">{dest.rating}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <MapPin className="w-4 h-4 text-gray-300" />
                                        <span className="text-sm text-gray-300">View Guide</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {dest.tags && dest.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* AI Insight */}
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">AI Insight</span>
                                        </div>
                                        <p className="text-xs text-gray-200 leading-relaxed">
                                            {dest.description || "Perfect destination based on your preferences."}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Destinations;
