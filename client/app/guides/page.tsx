"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useJourney } from "@/context/JourneyContext";
import { Search, SlidersHorizontal, Sparkles, X, Star, Check, ChevronRight, Clock, AlertCircle, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop";

// Mock Data (Fallback)
const mockGuides = [
    {
        id: "1",
        name: "Hiroshi T.",
        location: "Kyoto, Japan",
        languages: ["Japanese", "English"],
        rating: 4.9,
        reviews: 128,
        specialties: ["History", "Photography"],
        price: "₹40/hr",
        hourlyRate: 40,
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
        bio: "Local historian with 10 years of experience showing hidden Kyoto gems.",
        verified: true
    },
    // ... other mocks can remain or be fetched
];

export default function GuidesPage() {
    const router = useRouter();
    const { isSafetyMode } = useJourney();
    const { token, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuide, setSelectedGuide] = useState<any>(null);
    const [bookingStep, setBookingStep] = useState<"input" | "payment" | "success">("input"); // input, payment, success
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [guides, setGuides] = useState<any[]>([]);

    // Booking State
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState("1 Hour");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/guides`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setGuides(data);
                } else {
                    setGuides(mockGuides);
                }
            } catch (err) {
                console.error("Failed to fetch guides:", err);
                setGuides(mockGuides);
            }
        };
        fetchGuides();
    }, []);

    const filteredGuides = guides.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.specialties && g.specialties.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())));

        if (isSafetyMode) return matchesSearch && g.verified && g.rating >= 4.8;
        return matchesSearch;
    });

    // Time Slots (10:00 - 20:00)
    const timeSlots = Array.from({ length: 11 }, (_, i) => {
        const hour = 10 + i;
        return `${hour}:00`;
    });

    const durationOptions = [
        { label: "1 Hour", val: 1 },
        { label: "2 Hours", val: 2 },
        { label: "Half Day (4 Hours)", val: 4 },
        { label: "Full Day (8 Hours)", val: 8 }
    ];

    const calculatePrice = () => {
        if (!selectedGuide) return 0;
        const hours = durationOptions.find(d => d.label === duration)?.val || 1;
        // Handle various price formats (number, string with currency, etc)
        let rate = 40; // Default
        if (typeof selectedGuide.hourlyRate === 'number') rate = selectedGuide.hourlyRate;
        else if (selectedGuide.price) {
            const parsed = parseInt(selectedGuide.price.toString().replace(/[^0-9]/g, ''));
            if (!isNaN(parsed)) rate = parsed;
        }
        return rate * hours;
    };

    const handleBookingSubmit = async () => {
        setError("");
        if (!date || !time) {
            setError("Please select both date and time.");
            return;
        }
        if (!token) {
            setError("You must be logged in to book a guide.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Ensure city is present
            const city = selectedGuide.location ? selectedGuide.location.split(',')[0].trim() : "Unknown City";

            const res = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user?.id,
                    guideId: selectedGuide._id || selectedGuide.id,
                    date,
                    time,
                    duration,
                    message,
                    totalPrice: calculatePrice(),
                    city: city
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    throw new Error("This guide is already booked for this time slot. Please choose another time.");
                }
                throw new Error(data.message || "Booking failed");
            }

            setBookingId(data._id);
            setBookingStep("payment");
        } catch (err: any) {
            console.error("Booking failed:", err);
            setError(err.message || "Failed to create booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayment = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/payment/demo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId,
                    amount: calculatePrice()
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Payment failed");

            setBookingStep("success");
            // Optional: Refresh bookings or guide availability here
        } catch (err: any) {
            console.error("Payment failed:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Date Logic (Disable past dates)
    const today = new Date().toISOString().split('T')[0];

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* ... header code ... */}
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-12 px-6 container mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        Find Your Local Expert
                    </h1>
                    {isSafetyMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-bold mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            Safety Mode: Showing Verified Top-Rated Guides
                        </motion.div>
                    )}
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        Connect with verified locals for authentic, safe, and curated experiences.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative mb-12 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center shadow-2xl">
                            <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search guides by city, interest, or language..."
                                className="w-full bg-transparent border-none focus:outline-none text-white px-4 py-2 placeholder:text-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                <SlidersHorizontal className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Grid */}
            <section className="container mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredGuides.map((guide) => (
                            <motion.div
                                key={guide.id || guide._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 transition-all cursor-pointer flex flex-col"
                                onClick={() => {
                                    setSelectedGuide(guide);
                                    setBookingStep("input");
                                    setError("");
                                }}
                            >
                                {/* Cover / Image */}
                                <div className="p-6 pb-0 flex items-center gap-4">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                                        <Image src={guide.image || guide.imageUrl || DEFAULT_AVATAR} alt={guide.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white flex items-center gap-1">
                                            {guide.name}
                                            {guide.verified && <Check className="w-4 h-4 text-blue-400" />}
                                        </h3>
                                        <p className="text-sm text-gray-400">{guide.location}</p>
                                    </div>
                                </div>

                                <div className="p-6 pt-4 flex-1 flex flex-col">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {guide.specialties && guide.specialties.map((s: string) => (
                                            <span key={s} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/5">
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                                        {guide.bio}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-white">{guide.rating}</span>
                                            <span className="text-xs text-gray-500">({guide.reviews})</span>
                                        </div>
                                        <div className="font-mono font-bold text-blue-300">
                                            {guide.price || `₹${guide.hourlyRate}/hr`}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-hide"
                        >
                            <button
                                onClick={() => setSelectedGuide(null)}
                                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            <div className="p-5">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                                        <Image src={selectedGuide.image || selectedGuide.imageUrl || DEFAULT_AVATAR} alt={selectedGuide.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-mono">Book {selectedGuide.name}</h2>
                                        <p className="text-gray-400">{selectedGuide.location}</p>
                                        <p className="text-blue-400 text-sm font-bold mt-1">{selectedGuide.price || `₹${selectedGuide.hourlyRate}/hr`}</p>
                                    </div>
                                </div>

                                {bookingStep === "input" && (
                                    <div className="space-y-4">
                                        {/* Date Picker */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                            <input
                                                type="date"
                                                min={today}
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* Time Picker */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Start Time</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {timeSlots.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setTime(t)}
                                                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors border ${time === t
                                                            ? "bg-blue-600 border-blue-500 text-white"
                                                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</label>
                                            <div className="flex flex-wrap gap-2">
                                                {durationOptions.map(opt => (
                                                    <button
                                                        key={opt.label}
                                                        onClick={() => setDuration(opt.label)}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${duration === opt.label
                                                            ? "bg-purple-600 border-purple-500 text-white"
                                                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                                            }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message (Optional)</label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Any specific requests?"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-20 resize-none text-sm"
                                            />
                                        </div>

                                        {/* Price Summary */}
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mt-4">
                                            <span className="text-gray-400 text-sm">Total Price estimate</span>
                                            <span className="text-xl font-bold text-green-400">₹{calculatePrice()}</span>
                                        </div>

                                        {error && (
                                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                <AlertCircle className="w-4 h-4" />
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleBookingSubmit}
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                        >
                                            {isSubmitting ? "Initiating..." : "Confirm & Proceed to Payment"} <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {bookingStep === "payment" && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-400">Booking Summary</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold uppercase tracking-wider">Demo Mode</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Guide:</span>
                                                    <span className="text-gray-300 font-medium">{selectedGuide.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Schedule:</span>
                                                    <span className="text-gray-300 font-medium">{date} @ {time}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Duration:</span>
                                                    <span className="text-gray-300 font-medium">{duration}</span>
                                                </div>
                                                <div className="border-t border-white/10 my-2 pt-2 flex justify-between">
                                                    <span className="text-white font-bold">Total Amount:</span>
                                                    <span className="text-green-400 font-bold text-lg">₹{calculatePrice()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-center text-sm text-gray-400">
                                                Clicking "Pay Now" will simulate a payment and confirm your booking instantly.
                                            </p>

                                            {error && (
                                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {error}
                                                </div>
                                            )}

                                            <button
                                                onClick={handlePayment}
                                                disabled={isSubmitting}
                                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> Simulating Payment...</>
                                                ) : (
                                                    <><CreditCard className="w-5 h-5" /> Pay ₹{calculatePrice()} Now</>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setBookingStep("input")}
                                                disabled={isSubmitting}
                                                className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors py-2"
                                            >
                                                Back to Booking Details
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {bookingStep === "success" && (
                                    <div className="text-center py-6">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30"
                                        >
                                            <CheckCircle className="w-12 h-12 text-green-500" />
                                        </motion.div>
                                        <h3 className="text-3xl font-bold text-white mb-2 font-mono">Payment Successful!</h3>
                                        <p className="text-gray-400 mb-8 max-w-[280px] mx-auto text-sm leading-relaxed">
                                            Your trip with <strong>{selectedGuide.name}</strong> is now confirmed. You can find your booking in the dashboard.
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => router.push('/my-bookings')}
                                                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                            >
                                                View My Bookings
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedGuide(null);
                                                    setBookingStep("input");
                                                }}
                                                className="px-8 py-3 text-gray-500 hover:text-white transition-colors text-sm"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
