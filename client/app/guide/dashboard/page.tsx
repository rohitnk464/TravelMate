"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import { Calendar, Clock, Check, X, Loader2, MessageSquare, User, DollarSign, Image as ImageIcon, Upload, Link as LinkIcon, CheckCircle, BarChart, Activity, TrendingUp } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { API_BASE_URL } from "@/lib/config";

function GuideDashboardContent() {
    const { user, token } = useAuth();
    const socket = useSocket();
    const [bookings, setBookings] = useState<any[]>([]);
    const [guideId, setGuideId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [earnings, setEarnings] = useState<any>(null);
    const [profileData, setProfileData] = useState({
        location: '',
        bio: '',
        hourlyRate: '',
        languages: '',
        imageUrl: ''
    });

    const fetchGuideProfile = async () => {
        if (!user || !token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/guides/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const myGuide = await res.json();
                setGuideId(myGuide._id);
                fetchBookings(myGuide._id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuideProfile();
    }, [user, token]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing('profile');

        const formData = new FormData();
        formData.append('location', profileData.location);
        formData.append('bio', profileData.bio);
        formData.append('hourlyRate', profileData.hourlyRate);
        formData.append('languages', profileData.languages);
        formData.append('imageUrl', profileData.imageUrl);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/guides`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setGuideId(data._id);
                setShowProfileForm(false);
                fetchBookings(data._id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(null);
        }
    };

    const fetchBookings = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/guide/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEarnings = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/guides/earnings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEarnings(data);
            }
        } catch (err) {
            console.error("Failed to fetch earnings:", err);
        }
    };

    useEffect(() => {
        if (guideId) {
            fetchEarnings();
        }
    }, [guideId]);

    useEffect(() => {
        if (!socket) return;
        socket.on('booking_created', (data: any) => {
            if (data.guideId === guideId) {
                setBookings(prev => [data.booking, ...prev]);
            }
        });
        socket.on('booking_status_updated', (data: any) => {
            setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: data.status } : b));
        });
        return () => {
            socket.off('booking_created');
            socket.off('booking_status_updated');
        };
    }, [socket, guideId]);

    const handleAction = async (bookingId: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => {
        setProcessing(bookingId);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });

            const data = await res.json();

            if (res.ok) {
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
                alert(`Booking ${status.toLowerCase()} successfully!`);
                // Re-fetch earnings if completed
                if (status === 'COMPLETED') fetchEarnings();
            } else {
                alert(data.message || 'Failed to update booking status');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating booking status');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </main>
        );
    }

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const upcomingBookings = bookings.filter(b => b.status === 'ACCEPTED');
    const pastBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

    const BookingCard = ({ booking, isPending }: { booking: any, isPending?: boolean }) => (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold">{booking.userId?.name || "Guest"}</h4>
                        <p className="text-xs text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold border ${booking.status === 'PENDING' ? 'text-yellow-400 border-yellow-400/30' :
                    booking.status === 'ACCEPTED' ? 'text-green-400 border-green-400/30' :
                        'text-gray-400 border-gray-400/30'
                    }`}>
                    {booking.status}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(booking.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {booking.time} ({booking.duration})
                </div>
                <div className="flex items-center gap-2 text-gray-300 col-span-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 font-bold">₹{booking.totalPrice}</span>
                </div>
                {booking.message && (
                    <div className="flex items-start gap-2 text-gray-300 col-span-2 bg-black/20 p-2 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-1" />
                        <span className="italic">&quot;{booking.message}&quot;</span>
                    </div>
                )}
            </div>

            {isPending ? (
                <div className="mt-6 flex gap-2">
                    <button
                        onClick={() => handleAction(booking._id, 'ACCEPTED')}
                        disabled={!!processing}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                        onClick={() => handleAction(booking._id, 'REJECTED')}
                        disabled={!!processing}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" /> Reject
                    </button>
                </div>
            ) : booking.status === 'ACCEPTED' && (
                <div className="mt-6">
                    {booking.paymentStatus !== 'PAID' ? (
                        <div className="text-yellow-400 text-xs mb-3 text-center bg-yellow-400/10 py-2 rounded-lg border border-yellow-400/20 font-bold tracking-wide">
                            Waiting for traveler to pay.
                        </div>
                    ) : (
                        <div className="text-green-400 text-xs mb-3 text-center bg-green-400/10 py-2 rounded-lg border border-green-400/20 font-bold tracking-wide">
                            Payment Received! Ready for trip.
                        </div>
                    )}
                    <button
                        onClick={() => handleAction(booking._id, 'COMPLETED')}
                        disabled={!!processing || booking.paymentStatus !== 'PAID'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4" /> Mark as Completed
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <section className="pt-32 pb-12 px-6 container mx-auto">
                <h1 className="text-4xl font-bold mb-2">Guide Dashboard</h1>
                <p className="text-gray-400 mb-8">Welcome back, {user?.name}</p>

                {!guideId && !showProfileForm && (
                    <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center max-w-2xl mx-auto mb-12">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                        <p className="text-gray-400 mb-6 font-medium">To start receiving bookings and appear in our guide directory, you need to set up your public profile.</p>
                        <button
                            onClick={() => setShowProfileForm(true)}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                        >
                            Create Public Profile
                        </button>
                    </div>
                )}

                {!guideId && showProfileForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 mb-12"
                    >
                        <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase">City / Location</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Kyoto, Japan"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                        value={profileData.location}
                                        onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase">Hourly Rate (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="e.g. 40"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                        value={profileData.hourlyRate}
                                        onChange={e => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase">Languages (Comma separated)</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. English, Japanese, French"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                    value={profileData.languages}
                                    onChange={e => setProfileData({ ...profileData, languages: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Profile Image
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) setImageFile(file);
                                            }}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all h-24"
                                        >
                                            <Upload className="w-6 h-6 text-gray-500 mb-1 group-hover:text-blue-400" />
                                            <span className="text-xs font-bold text-gray-500 group-hover:text-blue-400 truncate max-w-full">
                                                {imageFile ? imageFile.name : 'Upload from device'}
                                            </span>
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <LinkIcon className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Or paste an image URL"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 h-24"
                                            value={profileData.imageUrl}
                                            onChange={e => setProfileData({ ...profileData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase">Short Bio</label>
                                <textarea
                                    required
                                    placeholder="Tell travelers about yourself and your expertise..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 h-32 resize-none"
                                    value={profileData.bio}
                                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing === 'profile'}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {processing === 'profile' ? 'Saving...' : 'Save and Publish'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProfileForm(false)}
                                    className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {guideId && (
                    <>
                        {/* Earnings Overview */}
                        {earnings && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-blue-400" />
                                    Performance Overview
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                                                <DollarSign className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">Total</span>
                                        </div>
                                        <div className="text-3xl font-mono font-bold text-white mb-1">₹{earnings.totalEarnings?.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest">Lifetime Earnings</div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Month</span>
                                        </div>
                                        <div className="text-3xl font-mono font-bold text-white mb-1">₹{earnings.monthlyEarnings?.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest">This Month</div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="text-3xl font-mono font-bold text-white mb-1">{earnings.completedBookings}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest">Completed Tours</div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                                                <X className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="text-3xl font-mono font-bold text-white mb-1">{earnings.cancellationRate}%</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest">Cancellation Rate</div>
                                    </div>
                                </div>

                                {/* Simple Chart */}
                                {earnings.earningsTrend && earnings.earningsTrend.length > 0 && (
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                                <h4 className="font-bold text-lg">Earnings Trend</h4>
                                            </div>
                                            <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-xs text-gray-400 focus:outline-none">
                                                <option>Last 6 Months</option>
                                            </select>
                                        </div>

                                        <div className="h-64 flex justify-between gap-4 px-4 pb-4">
                                            {earnings.earningsTrend.map((item: any, i: number) => {
                                                const maxVal = Math.max(...earnings.earningsTrend.map((d: any) => d.total)) || 1;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full">
                                                        <div className="w-full relative flex-1 flex items-end">
                                                            <div
                                                                className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-all rounded-t-lg relative group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                                                style={{ height: `${(item.total / maxVal) * 100}%` }}
                                                            >
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                                                                    ₹{item.total}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {item.label || new Date(0, item._id - 1).toLocaleString('default', { month: 'short' })}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                                    Pending Requests ({pendingBookings.length})
                                </h3>
                                {pendingBookings.map(b => <BookingCard key={b._id} booking={b} isPending />)}
                                {pendingBookings.length === 0 && <p className="text-gray-500 italic">No pending requests.</p>}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-400" />
                                    Upcoming Bookings ({upcomingBookings.length})
                                </h3>
                                {upcomingBookings.map(b => <BookingCard key={b._id} booking={b} />)}
                                {upcomingBookings.length === 0 && <p className="text-gray-500 italic">No upcoming bookings.</p>}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-gray-400" />
                                    History
                                </h3>
                                <div className="opacity-75">
                                    {pastBookings.map(b => <BookingCard key={b._id} booking={b} />)}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

export default function GuideDashboard() {
    return (
        <ProtectedRoute role="GUIDE">
            <GuideDashboardContent />
        </ProtectedRoute>
    );
}
