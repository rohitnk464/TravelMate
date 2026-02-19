"use client";

import { motion } from "framer-motion";
import { Coffee, MapPin, Camera, ShoppingBag, ArrowDown } from "lucide-react";

interface TimelineEvent {
    time: string;
    title: string;
    description: string;
    category: 'food' | 'attraction' | 'shopping' | 'other';
    lat: number;
    lng: number;
}

interface TimelineRendererProps {
    data: {
        timeline: TimelineEvent[];
    };
    onLocationSelect: (loc: { lat: number; lng: number; name: string }) => void;
    onStartPlan: () => void;
}

const getIcon = (category: string) => {
    switch (category) {
        case 'food': return <Coffee className="w-4 h-4" />;
        case 'attraction': return <Camera className="w-4 h-4" />;
        case 'shopping': return <ShoppingBag className="w-4 h-4" />;
        default: return <MapPin className="w-4 h-4" />;
    }
}

export default function TimelineRenderer({ data, onLocationSelect, onStartPlan }: TimelineRendererProps) {
    return (
        <div className="space-y-0 relative pl-4 border-l border-white/10 ml-2 my-4">
            {data.timeline.map((event, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="relative pl-6 pb-8 last:pb-0 group cursor-pointer"
                    onClick={() => onLocationSelect({ lat: event.lat, lng: event.lng, name: event.title })}
                >
                    {/* Dot on timeline */}
                    <div className="absolute -left-[21px] top-0 w-10 h-10 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-background border border-white/20 flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform bg-black">
                            {getIcon(event.category)}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-primary font-bold">{event.time}</span>
                            <span className="text-[10px] uppercase text-gray-500 tracking-wider">{event.category}</span>
                        </div>
                        <h4 className="font-bold text-white mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{event.description}</p>
                    </div>
                </motion.div>
            ))}

            {/* Start Plan Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: data.timeline.length * 0.2 }}
                className="pl-6 pt-4"
            >
                <button
                    onClick={onStartPlan}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold text-sm shadow-lg hover:brightness-110 transition-all active:scale-95"
                >
                    Start This Plan 🚀
                </button>
            </motion.div>
        </div>
    );
}
