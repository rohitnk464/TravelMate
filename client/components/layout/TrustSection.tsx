"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Users, Heart, Star, Quote } from "lucide-react";
import Image from "next/image";

const stats = [
    { label: "Active Travelers", value: "10,000+", icon: Users, color: "text-blue-400" },
    { label: "Safety Verified", value: "98%", icon: ShieldCheck, color: "text-green-400" },
    { label: "5-Star Reviews", value: "4.9/5", icon: Star, color: "text-yellow-400" },
    { label: "Community Trust", value: "100%", icon: Heart, color: "text-pink-400" },
];

const testimonialsFallback = [
    {
        name: "Sarah Jenkins",
        role: "Solo Traveler",
        location: "London, UK",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
        text: "TravelMate changed how I explore. The safety insights gave me the confidence to walk through Tokyo at night without a second thought."
    },
    {
        name: "Elena Rodriguez",
        role: "Digital Nomad",
        location: "Barcelona, Spain",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
        text: "As a woman traveling alone, safety is my #1 priority. The verified guides feature is a game-changer."
    },
    {
        name: "Priya Patel",
        role: "First-Time Backpacker",
        location: "Mumbai, India",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop",
        text: "The 'Safety Mode' isn't just a gimmick—it actually changes the routes! I felt so cared for knowing the AI was actively monitoring my journey."
    }
];

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/config";

const TrustSection = () => {
    const [testimonials, setTestimonials] = useState<any[]>(testimonialsFallback);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings/reviews`);
                const data = await res.json();
                if (data.length > 0) {
                    setTestimonials(data);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            }
        };
        fetchReviews();
    }, []);

    return (
        <section className="py-[120px] relative overflow-hidden bg-black/40">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        Trusted Travel, Proven Safety.
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of travelers who explore the world fearlessly with TravelMate's AI-powered protection.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={t.id || t.name + index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 group hover:border-white/20 transition-all"
                        >
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5 group-hover:text-white/10 transition-colors" />

                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                                    <Image
                                        src={t.image}
                                        alt={t.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{t.name}</h4>
                                    <p className="text-xs text-muted-foreground">{t.role} • {t.location}</p>
                                </div>
                            </div>

                            <p className="text-gray-300 leading-relaxed italic text-sm">
                                "{t.text}"
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Emotional CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-20"
                >
                    <p className="text-sm font-medium text-pink-400 tracking-widest uppercase mb-4">
                        Peace of Mind Included
                    </p>
                    <h3 className="text-xl md:text-2xl text-white font-light">
                        "Travel confidently knowing someone is always watching."
                    </h3>
                </motion.div>
            </div>
        </section>
    );
};

export default TrustSection;
