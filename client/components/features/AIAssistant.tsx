"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, ShieldCheck, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourney } from "@/context/JourneyContext";
import { usePathname } from "next/navigation";

const AIAssistant = () => {
    const { isSafetyMode, isOnline } = useJourney();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hi! I'm TravelMate AI. Where are you planning to go?" },
    ]);
    const [input, setInput] = useState("");

    // Hide on specific pages
    const hideOn = [
        "/",
        "/about",
        "/careers",
        "/terms",
        "/privacy",
        "/pricing",
        "/blog",
        "/contact",
        "/destinations",
        "/dashboard",
    ];

    if (
        hideOn.includes(pathname) ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.includes("/auth") ||
        pathname.startsWith("/api")
    ) return null;

    const handleSend = async () => {
        if (!input.trim() || !isOnline) return;

        const userMessage = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await fetch("http://localhost:5000/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input }),
            });

            const data = await response.json();

            if (data.message) {
                setMessages((prev) => [
                    ...prev,
                    { role: "ai", text: data.message, data: data.data },
                ]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "Sorry, I'm having trouble connecting to the server. Please try again later." },
            ]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-[350px] h-[500px] bg-background/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary/10 p-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">TravelMate AI</h3>
                                    {!isOnline ? (
                                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                            <WifiOff className="w-3 h-3" />
                                            Offline Mode
                                        </span>
                                    ) : isSafetyMode ? (
                                        <span className="text-xs text-blue-300 flex items-center gap-1 font-medium">
                                            <ShieldCheck className="w-3 h-3" />
                                            Safety Monitoring Active
                                        </span>
                                    ) : (
                                        <span className="text-xs text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            Online
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg: any, idx) => (
                                <div key={idx} className={cn("flex flex-col gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl text-sm",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-secondary text-secondary-foreground mr-auto rounded-tl-none"
                                        )}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Render Structured Data */}
                                    {msg.data && (
                                        <div className="mt-2 space-y-3 w-full">
                                            {/* Food/Places List */}
                                            {Array.isArray(msg.data) && (
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {msg.data.map((place: any, i: number) => (
                                                        <div key={i} className="min-w-[200px] bg-white/5 border border-white/10 p-3 rounded-xl">
                                                            <div className="font-bold text-sm">{place.name}</div>
                                                            {place.rating && <div className="text-xs text-yellow-400">★ {place.rating} • {place.cuisine}</div>}
                                                            {place.distance && <div className="text-xs text-gray-400">{place.distance} away</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Itinerary Data */}
                                            {msg.data.title && msg.data.stops && (
                                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                                                    <div className="font-bold text-primary">{msg.data.title}</div>
                                                    {msg.data.stops.map((stop: any, i: number) => (
                                                        <div key={i} className="flex gap-2 text-xs">
                                                            <div className="font-mono text-gray-400">{stop.time}</div>
                                                            <div>{stop.name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Safety Data */}
                                            {msg.data.status && (
                                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs space-y-1">
                                                    <div className="font-bold text-red-400">Status: {msg.data.status}</div>
                                                    <div>Nearest Police: {msg.data.nearestPolice?.name}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!isOnline && (
                                <div className="p-3 rounded-2xl text-sm bg-secondary text-secondary-foreground mr-auto rounded-tl-none border border-slate-700 flex items-center gap-2">
                                    <WifiOff className="w-4 h-4 text-slate-400" />
                                    <span className="italic text-slate-400">I am currently offline. I can't provide live updates, but your safety features are still actively monitoring locally.</span>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-background/50">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={!isOnline ? "Unavailable offline" : "Ask me anything..."}
                                    className="w-full bg-secondary/50 border border-white/10 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    disabled={!isOnline}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!isOnline}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 text-primary-foreground" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </motion.button>
        </div>
    );
};

export default AIAssistant;
