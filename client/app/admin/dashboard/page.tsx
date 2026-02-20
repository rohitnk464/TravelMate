"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Activity, AlertTriangle, Shield, CheckCircle, Clock, LayoutGrid, Map, UserCheck, Trash2, Volume2, DollarSign, MapPin, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import GuidesManager from "@/components/admin/GuidesManager";
import PlacesManager from "@/components/admin/PlacesManager";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";
import { Suspense } from "react";

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
    </svg>
);

function AdminDashboardContent() {
    const { token } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get("tab") || "overview";

    const setActiveTab = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`/admin/dashboard?${params.toString()}`);
    };

    const [incidents, setIncidents] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState(2845);
    const [users, setUsers] = useState<any[]>([]);
    const [guides, setGuides] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>({
        totalBookings: 0,
        totalRevenue: 0,
        cancellationRate: "0",
        mostBookedCity: "N/A",
        topGuide: "N/A"
    });
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/incidents`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setIncidents(data);
            } catch (error) {
                console.error("Failed to fetch incidents", error);
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };

        const fetchGuides = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/guides`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setGuides(data);
            } catch (error) {
                console.error("Failed to fetch guides", error);
            }
        };

        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
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
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch all bookings", error);
            }
        };

        if (token) {
            fetchIncidents();
            fetchUsers();
            fetchGuides();
            fetchAnalytics();
            fetchAllBookings();
        }

        const interval = setInterval(() => {
            fetchIncidents();
            fetchAnalytics();
        }, 5000);
        const userInterval = setInterval(() => {
            setActiveUsers(prev => prev + Math.floor(Math.random() * 10) - 4);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(userInterval);
        };
    }, [token]);

    const handleToggleVerifyGuide = async (guideId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/guides/${guideId}/approve`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setGuides(prev => prev.map(g => g._id === guideId ? { ...g, isVerified: !currentStatus, role: 'GUIDE' } : g));
                console.log("Guide verification toggled successfully");
            } else {
                const errorData = await res.json();
                console.error("Approval failed:", errorData.message);
                alert(`Approval failed: ${errorData.message}`);
                // Refresh list on failure to ensure UI is in sync
                const guidesRes = await fetch(`${API_BASE_URL}/api/admin/guides`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await guidesRes.json();
                setGuides(data);
            }
        } catch (error) {
            console.error("Failed to approve guide", error);
            alert("Connection error. Please check if the server is running.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(prev => prev.filter(u => u._id !== userId));
            setGuides(prev => prev.filter(g => g._id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const activeAlertsCount = incidents.filter(i => i.status !== 'resolved').length;
    const pendingGuides = guides.filter(g => !g.isVerified);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container mx-auto px-6 pt-32 pb-20">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground">System Overview & User Management</p>
                    </div>

                    <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-white/10 flex-wrap">
                        {[
                            { id: "overview", label: "Overview", icon: <LayoutGrid className="w-4 h-4" /> },
                            { id: "alerts", label: `Alerts ${activeAlertsCount > 0 ? `(${activeAlertsCount})` : ""}`, icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
                            { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
                            { id: "guides", label: `Guides ${pendingGuides.length > 0 ? `(${pendingGuides.length} pending)` : ""}`, icon: <UserCheck className="w-4 h-4" /> },
                            { id: "bookings", label: "Bookings", icon: <Clock className="w-4 h-4" /> },
                            { id: "places", label: "Places", icon: <Map className="w-4 h-4" /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                                )}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                {activeTab === "overview" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
                            {[
                                { label: "Total Revenue", value: `₹${analytics.totalRevenue?.toLocaleString() || 0}`, icon: <DollarSign className="w-6 h-6" />, color: "green", badge: "Live" },
                                { label: "Total Bookings", value: analytics.totalBookings, icon: <Activity className="w-6 h-6" />, color: "blue", badge: `+${analytics.totalBookings > 0 ? '5%' : '0'}` },
                                { label: "Cancellation Rate", value: `${analytics.cancellationRate}%`, icon: <TrendingUp className="w-6 h-6" />, color: "red" },
                                { label: "Top City", value: analytics.mostBookedCity, icon: <MapPin className="w-6 h-6" />, color: "purple" },
                                { label: "Top Guide", value: analytics.topGuide, icon: <UserCheck className="w-6 h-6" />, color: "yellow" },
                            ].map((stat, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("p-2.5 rounded-xl", {
                                            "bg-green-500/10 text-green-400": stat.color === 'green',
                                            "bg-blue-500/10 text-blue-400": stat.color === 'blue',
                                            "bg-red-500/10 text-red-400": stat.color === 'red',
                                            "bg-purple-500/10 text-purple-400": stat.color === 'purple',
                                            "bg-yellow-500/10 text-yellow-400": stat.color === 'yellow',
                                        })}>
                                            {stat.icon}
                                        </div>
                                        {stat.badge && <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", {
                                            "bg-green-500/10 text-green-400": stat.color === 'green',
                                            "bg-blue-500/10 text-blue-400": stat.color === 'blue',
                                        })}>{stat.badge}</span>}
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-white mb-1 truncate" title={stat.value?.toString()}>{stat.value || "N/A"}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                            <div className="relative z-10 flex justify-between items-center mb-8">
                                <h3 className="font-bold text-lg">User Activity Trend</h3>
                            </div>
                            <div className="h-48 w-full">
                                <LineChart />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-6">All Users ({users.length})</h2>
                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase tracking-wider">{user.role}</span>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && <p className="text-gray-500 italic">No users found.</p>}
                        </div>
                    </div>
                )}

                {activeTab === "guides" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-6">All Guides ({guides.length})</h2>
                        <div className="space-y-3">
                            {guides.map(guide => (
                                <div key={guide._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                            guide.isVerified ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                                        )}>
                                            {guide.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{guide.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-400">{guide.email}</p>
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Guide since {new Date(guide.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                            guide.isVerified ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                        )}>
                                            {guide.isVerified ? "Verified" : "Pending"}
                                        </span>
                                        <button
                                            onClick={() => handleToggleVerifyGuide(guide._id, guide.isVerified)}
                                            className={cn("flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors",
                                                guide.isVerified ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"
                                            )}
                                        >
                                            <Shield className="w-3 h-3" /> {guide.isVerified ? "Unverify" : "Verify"}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(guide._id)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete Guide"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {guides.length === 0 && <p className="text-gray-500 italic">No guides found.</p>}
                        </div>
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

                {activeTab === "alerts" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Active Safety Alerts</h2>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20">
                                    {incidents.filter(i => i.status === 'new').length} New
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {incidents.map((incident) => (
                                <div key={incident._id} className={cn(
                                    "p-6 rounded-2xl border transition-all",
                                    incident.status === 'new' ? "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]" : "bg-white/5 border-white/10"
                                )}>
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                incident.status === 'new' ? "bg-red-500 text-white animate-pulse" : "bg-zinc-800 text-gray-400"
                                            )}>
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg">{incident.user.name}</h3>
                                                    <span className="text-xs text-gray-500">•</span>
                                                    <span className="text-xs text-gray-400">{new Date(incident.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-sm font-medium text-red-400 mb-2 uppercase tracking-wider">{incident.trigger}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Map className="w-3 h-3" /> {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {incident.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                {incident.audioUrl && (
                                                    <div className="mt-4 p-3 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                            <Volume2 className="w-4 h-4 text-purple-400" />
                                                        </div>
                                                        <audio
                                                            src={`${API_BASE_URL}${incident.audioUrl}`}
                                                            controls
                                                            className="h-8 w-full max-w-[200px]"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:self-center">
                                            {incident.status === 'new' && (
                                                <button
                                                    onClick={async () => {
                                                        const res = await fetch(`${API_BASE_URL}/api/admin/incidents/${incident._id}`, {
                                                            method: 'PATCH',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({ status: 'acknowledged' })
                                                        });
                                                        if (res.ok) {
                                                            setIncidents(prev => prev.map(i => i._id === incident._id ? { ...i, status: 'acknowledged' } : i));
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                            {incident.status === 'acknowledged' && (
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        className="bg-zinc-800 text-xs text-white px-2 py-1 rounded border border-white/10"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                fetch(`${API_BASE_URL}/api/admin/incidents/${incident._id}`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                    body: JSON.stringify({ log: { text: `Assigned Guide: ${e.target.options[e.target.selectedIndex].text}`, time: new Date(), source: "Admin" } })
                                                                });
                                                                alert(`Dispatched ${e.target.options[e.target.selectedIndex].text} to incident location.`);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Dispatch Verified Guide...</option>
                                                        {guides.filter(g => g.isVerified).map(g => (
                                                            <option key={g._id} value={g._id}>{g.name} (Verified)</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={async () => {
                                                            const res = await fetch(`${API_BASE_URL}/api/admin/incidents/${incident._id}`, {
                                                                method: 'PATCH',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'Authorization': `Bearer ${token}`
                                                                },
                                                                body: JSON.stringify({ status: 'resolved' })
                                                            });
                                                            if (res.ok) {
                                                                setIncidents(prev => prev.filter(i => i._id !== incident._id));
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors w-full"
                                                    >
                                                        Resolve
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {incidents.length === 0 && (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                                    <CheckCircle className="w-12 h-12 mx-auto text-green-500/50 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-300">System Secure</h3>
                                    <p className="text-gray-500 mt-2">No active safety alerts at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute role="ADMIN">
            <Suspense fallback={
                <main className="min-h-screen bg-background flex items-center justify-center">
                    <Clock className="w-8 h-8 animate-spin text-primary" />
                </main>
            }>
                <AdminDashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
