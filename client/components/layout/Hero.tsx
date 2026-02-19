"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const heroImages = [
    "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?q=80&w=2000&auto=format&fit=crop", // City Night
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2000&auto=format&fit=crop", // London
    "https://images.unsplash.com/photo-1542259681-d2522fae5d64?q=80&w=2000&auto=format&fit=crop", // Tokyo
];

export default function Hero() {
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLocating, setIsLocating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 400]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleExploreLocally = async () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Call backend reverse geocoding
                    const response = await fetch(`http://localhost:5000/api/openmap/reverse?lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Local City";
                        router.push(`/dashboard?location=${encodeURIComponent(city)}`);
                    } else {
                        // Fallback to manual selection if city not found
                        alert("Could not detect your city. Please select manually.");
                        const destinationsSection = document.querySelector('section:has(h2)');
                        destinationsSection?.scrollIntoView({ behavior: 'smooth' });
                    }
                } catch (error) {
                    console.error("Error fetching location:", error);
                    alert("Failed to detect location. Using fallback.");
                    router.push(`/dashboard?location=Bangalore`);
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Location access denied. Please select your city manually.");
                setIsLocating(false);
                const destinationsSection = document.querySelector('section:has(h2)');
                destinationsSection?.scrollIntoView({ behavior: 'smooth' });
            }
        );
    };

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
            {/* Rotating Background with Parallax */}
            <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
                        />
                        {/* Premium Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-black/30" />
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
                {/* Context Chips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-4 mb-8"
                >
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Global Support</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md">
                        <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">AI Agent Ready</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-md">
                        <Shield className="w-3 h-3 text-rose-400" />
                        <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Safety First</span>
                    </div>
                </motion.div>

                {/* Typography */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Fearlessly.</span> <br />
                        Explore <span className="font-serif italic text-white/90">Locally.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
                        Your AI-powered companion for navigating new cities. Connect with trusted locals, get real-time safety alerts, and discover hidden gems.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => {
                            const destinationsSection = document.querySelector('section:has(h2)');
                            destinationsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Start Exploring <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleExploreLocally}
                        disabled={isLocating}
                        className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isLocating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Locating...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-5 h-5" /> Explore Locally
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            window.location.href = '/safety';
                        }}
                        className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-md"
                    >
                        <Shield className="w-5 h-5" /> Safety Features
                    </button>
                </motion.div>
            </div>
        </section>
    );
}