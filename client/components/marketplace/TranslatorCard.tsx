"use client";

import { Star, MapPin, CheckCircle, Globe, Sparkles } from "lucide-react";
import Image from "next/image";
import { Translator } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useJourney } from "@/context/JourneyContext";

interface TranslatorCardProps {
    translator: Translator;
    onBook: (translator: Translator) => void;
}

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop";

export default function TranslatorCard({ translator, onBook }: TranslatorCardProps) {
    const { isSafetyMode } = useJourney();
    const [showAnalysis, setShowAnalysis] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-white/5 border rounded-2xl overflow-hidden hover:bg-white/10 transition-colors group ${isSafetyMode && translator.verified ? "border-pink-500/30 shadow-lg shadow-pink-500/10" : "border-white/10"
                }`}
        >
            <div className="relative h-48 w-full">
                <Image
                    src={translator.imageUrl || DEFAULT_AVATAR}
                    alt={translator.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Women Safe Badge */}
                {isSafetyMode && translator.verified && (
                    <div className="absolute top-4 right-4 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <CheckCircle className="w-3 h-3" /> Women-Safe Verified
                    </div>
                )}

                <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        {translator.name}
                        {translator.verified && <CheckCircle className="w-5 h-5 text-blue-400 fill-blue-400/20" />}
                    </h3>
                    <p className="text-sm text-gray-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {translator.location}
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span className="font-bold">{translator.rating}</span>
                        <span className="text-gray-500">({translator.reviews})</span>
                    </div>
                    <div className="font-bold text-lg text-primary">
                        ₹{translator.hourlyRate}<span className="text-xs text-gray-400 font-normal">/hr</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {translator.languages.map(lang => (
                        <span key={lang} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {lang}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {translator.bio}
                </p>

                <div className="pt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowAnalysis(!showAnalysis);
                        }}
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-3 transition-colors"
                    >
                        <Sparkles className="w-3 h-3" />
                        {showAnalysis ? "Hide Match Analysis" : "Why this match?"}
                    </button>

                    <AnimatePresence>
                        {showAnalysis && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-3 text-xs space-y-2">
                                    <div className="flex items-center gap-2 text-blue-200 font-semibold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                        98% Match Score
                                    </div>
                                    <p className="text-gray-300">
                                        Perfect match for <strong>English</strong> speakers interested in <strong>History</strong>. Verified identity and high safety rating ({translator.rating}).
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => onBook(translator)}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10 hover:border-white/30"
                    >
                        View Profile & Book
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
