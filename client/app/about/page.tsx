"use client";

import { motion } from "framer-motion";
import { Shield, Globe, Heart, Users } from "lucide-react";

const stats = [
    { label: "Safe Journeys", value: "10,000+" },
    { label: "Verified Guides", value: "500+" },
    { label: "Cities Covered", value: "50+" },
    { label: "Avg Safety Rating", value: "4.9/5" },
];

const values = [
    {
        icon: Shield,
        title: "Safety First",
        description: "We believe travel should be free from fear. Our AI monitoring and verified network ensure your peace of mind."
    },
    {
        icon: Globe,
        title: "Global Connection",
        description: "Bridging cultures through language and verified local companionship."
    },
    {
        icon: Heart,
        title: "Community Driven",
        description: "Built by travelers, for travelers. We prioritize the well-being of our community above all."
    }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            {/* Hero */}
            <section className="container mx-auto px-6 text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400"
                >
                    Empowering Safe Exploration
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                    TravelMate is more than just a travel app. It's a guardian, a guide, and a companion for your global adventures.
                </motion.p>
            </section>

            {/* Stats */}
            <section className="container mx-auto px-6 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-secondary/30 border border-white/5 text-center"
                        >
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mission */}
            <section className="container mx-auto px-6 mb-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            In a world that is increasingly connected yet sometimes unpredictable, we saw a need for a travel companion that doesn't just show you where to go, but ensures you get there safely.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            TravelMate integrates cutting-edge AI with a human touch, providing real-time safety monitoring, verified local guides, and instant emergency support. We are protecting distinct journeys, one adventure at a time.
                        </p>
                    </div>
                    <div className="grid gap-6">
                        {values.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                            >
                                <div className="p-3 rounded-full bg-primary/20 text-primary">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
