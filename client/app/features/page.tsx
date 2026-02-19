"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Cpu, Users, WifiOff, Map, Smartphone } from "lucide-react";

const features = [
    {
        icon: ShieldAlert,
        title: "Real-Time Threat Monitoring",
        description: "Our AI constantly scans local news and safety reports to alert you of potential risks in your vicinity before they happen."
    },
    {
        icon: Cpu,
        title: "Context-Aware AI Assistant",
        description: "More than a chatbot. Our AI understands your location, battery life, and safety status to provide proactive assistance."
    },
    {
        icon: Users,
        title: "Verified Local Guides",
        description: "Connect with background-checked locals for safe exploration, translation assistance, and cultural immersion."
    },
    {
        icon: WifiOff,
        title: "Offline Safety Protocol",
        description: "No internet? No problem. Emergency contacts, maps, and SOS signals are queued and processed locally."
    },
    {
        icon: Map,
        title: "Dynamic Safe Routing",
        description: "Navigation that prioritizes well-lit, populated routes over just the shortest distance."
    },
    {
        icon: Smartphone,
        title: "Live Location Sharing",
        description: "Share your live journey with trusted contacts. They get alerted if you deviate from your path or stop unexpectedly."
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            {/* Hero */}
            <section className="container mx-auto px-6 text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                >
                    Safety Intelligence <br />
                    <span className="text-primary">Meets Adventure</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                    Explore the powerful tools designed to keep you safe, connected, and informed wherever you go.
                </motion.p>
            </section>

            {/* Grid */}
            <section className="container mx-auto px-6 mb-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-secondary/30 border border-white/5 hover:border-primary/50 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
