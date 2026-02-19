"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Activity, AlertTriangle, Shield, CheckCircle, Clock, LayoutGrid, Map, FileText, Navigation, MapPin, UserCheck, DollarSign, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import GuidesManager from "@/components/admin/GuidesManager";
import { API_BASE_URL } from "@/lib/config";
import PlacesManager from "@/components/admin/PlacesManager";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

// Mock Charts (SVG)
const LineChart = () => (
    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
        <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
        </defs>
        <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M0,150 L0,100 C50,80 100,120 150,60 C200,40 250,90 300,50 C350,20 400,60 450,30 L500,80 L500,150 Z"
            fill="url(#gradient)"
        />
        <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M0,100 C50,80 100,120 150,60 C200,40 250,90 300,50 C350,20 400,60 450,30 L500,80"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
        />
        {[
            { cx: 150, cy: 60 },
            { cx: 300, cy: 50 },
            { cx: 450, cy: 30 }
        ].map((point, i) => (
            <motion.circle
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + i * 0.2 }}
                cx={point.cx}
                cy={point.cy}
                r="4"
                fill="white"
            />
        ))}
    </svg>
);

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [incidents, setIncidents] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState(2845);
    const [liveTrackings, setLiveTrackings] = useState<{ [key: string]: any }>({});
    const [bookings, setBookings] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>({
        totalBookings: 0,
        totalRevenue: 0,
        cancellationRate: "0",
        mostBookedCity: "N/A",
        topGuide: "N/A"
    });
    const socket = useSocket();

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/incidents`);
                const data = await res.json();
                setIncidents(data);
            } catch (error) {
                console.error("Failed to fetch incidents", error);
            }
        };

        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            }
        };

        const fetchAllBookings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch all bookings", error);
            }
        };

        const fetchActiveSharers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/active-sharers`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                const trackingMap: { [key: string]: any } = {};
                data.forEach((user: any) => {
                    if (user.lastKnownLocation) {
                        trackingMap[user._id] = {
                            userId: user._id,
                            name: user.name,
                            location: { lat: user.lastKnownLocation.lat, lng: user.lastKnownLocation.lng },
                            address: user.lastKnownLocation.address,
                            lastUpdate: user.lastKnownLocation.updatedAt
                        };
                    }
                });
                setLiveTrackings(trackingMap);
            } catch (error) {
                console.error("Failed to fetch active sharers", error);
            }
        };

        fetchIncidents();
        fetchActiveSharers();
        fetchAnalytics();
        fetchAllBookings();

        const interval = setInterval(() => {
            fetchIncidents();
            fetchAllBookings();
            fetchAnalytics();
        }, 5000); // Poll every 5s

        // Simulate real-time user fluctuation
        const userInterval = setInterval(() => {
            setActiveUsers(prev => prev + Math.floor(Math.random() * 10) - 4);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(userInterval);
        };
    }, []);

    // Socket listeners for live tracking
    useEffect(() => {
        if (socket) {
            socket.on('admin_location_update', (data: any) => {
                setLiveTrackings(prev => ({
                    ...prev,
                    [data.userId]: {
                        ...data,
                        lastUpdate: new Date()
                    }
                }));
            });
        }

        return () => {
            if (socket) socket.off('admin_location_update');
        };
    }, [socket]);

    const activeAlertsCount = incidents.filter(i => i.status !== 'resolved').length;

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-20">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* ... header content ... */}
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
                            Command Center
                        </h1>
                        <p className="text-muted-foreground">System Overview & Content Management</p>
                    </div>

                    <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-white/10">
                        {/* ... tabs ... */}
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === "overview" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("guides")}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === "guides" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Users className="w-4 h-4" /> Guides
                        </button>
                        <button
                            onClick={() => setActiveTab("places")}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === "places" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Map className="w-4 h-4" /> Places
                        </button>
                        <button
                            onClick={() => setActiveTab("tracking")}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === "tracking" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Navigation className="w-4 h-4" /> Live Tracking
                            {Object.keys(liveTrackings).length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("bookings")}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === "bookings" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Clock className="w-4 h-4" /> Bookings
                        </button>
                    </div>
                </header>

                {activeTab === "overview" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <div className="text-3xl font-mono font-bold text-white mb-1">
                                    {(analytics.totalUsers || activeUsers).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">Registered Users</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">Rate</span>
                                </div>
                                <div className="text-3xl font-mono font-bold text-white mb-1">{analytics.cancellationRate}%</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">Cancellation Rate</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-mono font-bold text-white mb-1">{analytics.totalBookings}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">Total Bookings</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-mono font-bold text-white mb-1">₹{analytics.totalRevenue?.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">Total Revenue</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1 truncate" title={analytics.mostBookedCity}>
                                    {analytics.mostBookedCity || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">Top City</div>
                            </div>
                        </div>

                        {/* Main Content Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Traffic Chart */}
                            <div className="lg:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                                {/* ... chart ... */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                                <div className="relative z-10 flex justify-between items-center mb-8">
                                    <h3 className="font-bold text-lg">User Activity Trend</h3>
                                    <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-300">
                                        <option>Last 24 Hours</option>
                                        <option>Last 7 Days</option>
                                    </select>
                                </div>
                                <div className="h-64 w-full">
                                    <LineChart />
                                </div>
                            </div>

                            {/* Recent Logs / Incidents */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-lg mb-6">Live Alerts & Logs</h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {incidents.length === 0 ? (
                                        <div className="text-gray-500 text-sm italic">No active system alerts.</div>
                                    ) : (
                                        incidents.map((incident, i) => (
                                            <div key={i} className="flex flex-col gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5">
                                                <div className="flex gap-3 items-start">
                                                    <div className={`mt-1 w-2 h-2 rounded-full ${incident.status === "resolved" ? "bg-green-500" : incident.status === "acknowledged" ? "bg-yellow-500" : "bg-red-500 animate-pulse"
                                                        }`} />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div className="text-sm text-gray-300 font-medium">SOS Triggered: {incident.user?.name || "Unknown User"}</div>
                                                            <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${incident.status === "resolved" ? "bg-green-500/10 text-green-400" : incident.status === "acknowledged" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
                                                                }`}>
                                                                {incident.status}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-red-400 mt-1">{incident.trigger || "Manual SOS"}</div>
                                                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                                            <Clock className="w-3 h-3" /> {new Date(incident.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Admin Actions */}
                                                {incident.status !== 'resolved' && (
                                                    <div className="flex gap-2 pl-5 mt-1">
                                                        {incident.status === 'new' && (
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await fetch(`${API_BASE_URL}/api/admin/incidents/${incident._id}`, {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ status: 'acknowledged', log: { text: "Admin acknowledged alert.", time: new Date(), source: "Admin" } })
                                                                        });
                                                                        // Refresh immediately
                                                                        const res = await fetch(`${API_BASE_URL}/api/admin/incidents`);
                                                                        const data = await res.json();
                                                                        setIncidents(data);
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-600/30 transition-colors flex 1"
                                                            >
                                                                Accept & Monitor
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await fetch(`${API_BASE_URL}/api/admin/incidents/${incident._id}`, {
                                                                        method: 'PATCH',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ status: 'resolved', log: { text: "Admin marked as safe.", time: new Date(), source: "Admin" } })
                                                                    });
                                                                    // Refresh immediately
                                                                    const res = await fetch(`${API_BASE_URL}/api/admin/incidents`);
                                                                    const data = await res.json();
                                                                    setIncidents(data);
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs font-bold rounded-lg border border-green-600/30 transition-colors flex 1"
                                                        >
                                                            Mark as Safe
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button className="w-full mt-6 py-2 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                                    View All Logs
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "guides" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <GuidesManager />
                    </div>
                )}

                {activeTab === "places" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PlacesManager />
                    </div>
                )}

                {activeTab === "bookings" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">All Platform Bookings ({bookings.length})</h2>
                        </div>
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div key={booking._id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{booking.userId?.name || 'Unknown User'}</p>
                                                <p className="text-[10px] text-gray-400">Customer</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <UserCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{booking.guideId?.userId?.name || booking.guideId?.name || 'Unknown Guide'}</p>
                                                <p className="text-[10px] text-gray-400">Guide</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm font-mono text-gray-300">₹{booking.totalPrice?.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{booking.city} • {new Date(booking.date).toLocaleDateString()}</p>
                                        </div>

                                        <div className="flex justify-between md:justify-end items-center gap-4">
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                                booking.status === 'ACCEPTED' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                                    booking.status === 'PENDING' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                                        booking.status === 'COMPLETED' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                            "bg-red-500/10 text-red-400 border border-red-500/20"
                                            )}>
                                                {booking.status}
                                            </span>
                                            <p className="text-[10px] text-gray-500 font-mono">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                                    <Clock className="w-12 h-12 mx-auto text-gray-600 mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-gray-400">No Bookings Yet</h3>
                                    <p className="text-gray-500 mt-2">Bookings across the platform will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "tracking" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative h-[600px] flex items-center justify-center">
                                    <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674')" }} />
                                    <div className="relative text-center">
                                        <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-xl font-bold mb-2">Live Fleet View</h3>
                                        <p className="text-muted-foreground max-w-sm">
                                            Select a user from the list to focus on their real-time path and safety status.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-accent" />
                                    Active Sharers
                                </h3>
                                <div className="space-y-4">
                                    {Object.keys(liveTrackings).length === 0 ? (
                                        <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                                            <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-gray-500 italic">No users currently sharing location.</p>
                                        </div>
                                    ) : (
                                        Object.values(liveTrackings).map((track: any) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={track.userId}
                                                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/40 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                                                        {track.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold group-hover:text-accent transition-colors">{track.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Tracking</p>
                                                    </div>
                                                    <div className="ml-auto w-2 h-2 rounded-full bg-accent animate-ping" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2 text-xs text-gray-400">
                                                        <MapPin className="w-3 h-3 mt-0.5 text-accent" />
                                                        <span className="line-clamp-2">{track.address}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                                        <span>{track.location.lat.toFixed(4)}, {track.location.lng.toFixed(4)}</span>
                                                        <span>{new Date(track.lastUpdate).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
