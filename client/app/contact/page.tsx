"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");
        // Simulate sending
        setTimeout(() => setStatus("sent"), 1500);
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <section className="container mx-auto px-6 mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Have questions about our safety features or want to join as a guide? We're here to help.
                </p>
            </section>

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 max-w-5xl">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5">
                        <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/20 text-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email Us</p>
                                    <p className="font-medium">support@travelmate.ai</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/20 text-primary">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Emergency Line</p>
                                    <p className="font-medium">+1 (800) SAFETY-1</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/20 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Headquarters</p>
                                    <p className="font-medium">San Francisco, CA</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            Note
                        </h4>
                        <p className="text-sm">
                            For immediate emergency assistance, please use the SOS button in the app or dial local emergency services directly.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-3xl bg-secondary/50 border border-white/10"
                >
                    {status === "sent" ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                            <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                            <button
                                onClick={() => setStatus("idle")}
                                className="mt-8 text-primary hover:underline"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "sending"}
                                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {status === "sending" ? "Sending..." : "Send Message"}
                                {!status && <Send className="w-4 h-4" />}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
