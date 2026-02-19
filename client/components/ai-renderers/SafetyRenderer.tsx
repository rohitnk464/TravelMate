"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Navigation } from "lucide-react";

interface SafetyAlert {
    level: 'low' | 'medium' | 'high';
    message: string;
}

interface SafeZone {
    id: string;
    name: string;
    type: string;
    lat: number;
    lng: number;
    distance: string;
}

interface SafetyRendererProps {
    data: {
        alerts: SafetyAlert[];
        safe_zones: SafeZone[];
    };
    onLocationSelect: (loc: { lat: number; lng: number; name: string }) => void;
}

export default function SafetyRenderer({ data, onLocationSelect }: SafetyRendererProps) {
    return (
        <div className="space-y-4">
            {/* Safety Alerts Section */}
            {data.alerts.length > 0 && (
                <div className="space-y-2">
                    {data.alerts.map((alert, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`p-3 rounded-xl border flex items-start gap-3 ${alert.level === 'high' ? 'bg-red-500/10 border-red-500/30' :
                                    alert.level === 'medium' ? 'bg-orange-500/10 border-orange-500/30' :
                                        'bg-blue-500/10 border-blue-500/30'
                                }`}
                        >
                            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.level === 'high' ? 'text-red-400' :
                                    alert.level === 'medium' ? 'text-orange-400' :
                                        'text-blue-400'
                                }`} />
                            <div className="text-sm text-gray-200">{alert.message}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Safe Zones List */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Verified Safe Zones
                </h4>
                <div className="grid gap-2">
                    {data.safe_zones.map((zone, idx) => (
                        <motion.div
                            key={zone.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-green-500/5 border border-green-500/10 p-3 rounded-xl flex items-center justify-between hover:bg-green-500/10 transition-colors cursor-pointer"
                            onClick={() => onLocationSelect({ lat: zone.lat, lng: zone.lng, name: zone.name })}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-green-100">{zone.name}</div>
                                    <div className="text-xs text-green-400/70 capitalize">{zone.type} • {zone.distance}</div>
                                </div>
                            </div>
                            <button className="bg-green-500/20 p-2 rounded-full hover:bg-green-500/30 text-green-400 transition-colors">
                                <Navigation className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
