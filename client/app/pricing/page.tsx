"use client";

import { motion } from "framer-motion";
import { Check, Shield, Star } from "lucide-react";

const plans = [
    {
        name: "Explorer",
        price: "$0",
        period: "/forever",
        description: "Essential safety for solo travelers.",
        features: [
            "Basic Safety Alerts",
            "AI Assistant (Limit 10/day)",
            "Community Support",
            "Public Safe Places Map"
        ],
        cta: "Get Started",
        popular: false
    },
    {
        name: "Guardian",
        price: "$9.99",
        period: "/month",
        description: "Advanced protection for peace of mind.",
        features: [
            "Real-Time Threat Monitoring",
            "Unlimited AI Assistant",
            "Live Agent Support (SOS)",
            "Offline Maps & Safety Data",
            "Verified Guide Discounts"
        ],
        cta: "Start Free Trial",
        popular: true
    },
    {
        name: "Family",
        price: "$19.99",
        period: "/month",
        description: "Complete safety for your whole group.",
        features: [
            "Everything in Guardian",
            "Up to 5 Family Members",
            "Group Live Tracking",
            "Dedicated Safety Concierge",
            "Trip Itinerary Planning"
        ],
        cta: "Choose Family",
        popular: false
    }
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <section className="container mx-auto px-6 text-center mb-20">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">Invest in Your Safety</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Choose the plan that fits your journey.
                </p>
            </section>

            <section className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-8 rounded-3xl border flex flex-col ${plan.popular
                                    ? "bg-secondary/50 border-primary shadow-2xl shadow-primary/10 scale-105 z-10"
                                    : "bg-background border-white/10"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                                    <span className="bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.period}</span>
                            </div>

                            <button className={`w-full py-3 rounded-xl font-bold mb-8 transition-colors ${plan.popular
                                    ? "bg-primary text-white hover:bg-primary/90"
                                    : "bg-white/10 hover:bg-white/20"
                                }`}>
                                {plan.cta}
                            </button>

                            <div className="space-y-4 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className={feature.startsWith("Unlimited") ? "font-semibold text-white" : "text-muted-foreground"}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
