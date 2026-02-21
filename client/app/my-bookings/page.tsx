"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, XCircle, CheckCircle, AlertCircle, MessageSquare, Loader2, Star, CreditCard } from "lucide-react";
import Image from "next/image";
import BookingChat from "@/components/features/BookingChat";
import { API_BASE_URL } from "@/lib/config";

export default function MyBookingsPage() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<string | null>(null);

    // Review State
    const [reviewing, setReviewing] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    // Chat State
    const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (user && token) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const fetchBookings = async () => {
        try {
            const userId = user?.id || user?._id;
            if (!userId) return;

            setLoading(true);
            const travelerUrl = `${API_BASE_URL}/api/bookings/user/${userId}`;

            const [travelerRes] = await Promise.all([
                fetch(travelerUrl, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            let travelerData = travelerRes.ok ? await travelerRes.json() : [];

            // If user is a guide, also fetch their "work" bookings as a guide
            let guideData = [];
            if (user?.role === 'GUIDE') {
                const guideProfileRes = await fetch(`${API_BASE_URL}/api/guides/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (guideProfileRes.ok) {
                    const guideProfile = await guideProfileRes.json();
                    const guideBookingsRes = await fetch(`${API_BASE_URL}/api/bookings/guide/${guideProfile._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (guideBookingsRes.ok) {
                        guideData = await guideBookingsRes.json();
                    }
                }
            }

            // Merge and sort by date descending
            const combinedBookings = [...travelerData, ...guideData].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            // Deduplicate by ID just in case
            const uniqueBookings = Array.from(new Map(combinedBookings.map(b => [b._id, b])).values());

            setBookings(uniqueBookings);
        } catch (error) {
            console.error("Fetch bookings error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        setCancelling(bookingId);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'CANCELLED' })
            });
            if (res.ok) {
                fetchBookings(); // Refresh
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCancelling(null);
        }
    };

    const handleStatusUpdate = async (bookingId: string, status: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchBookings(); // Refresh
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleReviewSubmit = async () => {
        if (!reviewing) return;
        setSubmittingReview(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${reviewing}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                setReviewing(null);
                setRating(5);
                setComment("");
                fetchBookings(); // Refresh to show review
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingReview(false);
        }
    };

    const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
    const [checkoutBooking, setCheckoutBooking] = useState<any>(null); // Controls the overlay
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");

    const handlePayment = async (bookingId: string, amount: number) => {
        setPaymentStatus("processing");
        try {
            const res = await fetch(`${API_BASE_URL}/api/payment/demo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bookingId, amount })
            });

            if (res.ok) {
                setPaymentStatus("success");
                fetchBookings();
            } else {
                const data = await res.json();
                alert(data.message || "Payment failed");
                setCheckoutBooking(null);
                setPaymentStatus("idle");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during payment.");
            setCheckoutBooking(null);
            setPaymentStatus("idle");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'APPROVED': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'PAID': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
            case 'PENDING': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'CANCELLED': return 'text-red-400 border-red-400/30 bg-red-400/10';
            case 'REJECTED': return 'text-red-400 border-red-400/30 bg-red-400/10';
            case 'COMPLETED': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
            default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
        }
    };

    if (!user) {
        return (
            <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
                    <p className="text-gray-400">You need to be logged in to view your bookings.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <section className="pt-32 pb-12 px-6 container mx-auto">
                <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <Calendar className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300">
                            {user.role === 'GUIDE' ? "No work history yet" : "No bookings yet"}
                        </h3>
                        <p className="text-gray-500 mt-2">
                            {user.role === 'GUIDE' ? "Incoming bookings from travelers will appear here." : "Explore guides and find your next adventure!"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((booking) => {
                            const currentUserId = user?.id || user?._id;
                            const isPassenger = booking.userId === currentUserId || booking.userId?._id === currentUserId;
                            const participant = isPassenger ? booking.guideId : booking.userId;

                            return (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative"
                                >
                                    {/* Participant Info (Guide or Traveler) */}
                                    <div className="flex items-center gap-4 w-full md:w-1/3">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                                            <Image
                                                src={isPassenger
                                                    ? (participant?.imageUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d")
                                                    : (participant?.profileImage || "https://images.unsplash.com/photo-153571501da13-d0b8b0px583c")
                                                }
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {participant?.name || "Unknown"}
                                            </h3>
                                            <p className="text-sm text-gray-400 flex items-center gap-1">
                                                {!isPassenger ? (
                                                    <>Traveler &bull; {participant?.email}</>
                                                ) : (
                                                    <>
                                                        <MapPin className="w-3 h-3" /> {participant?.location || booking.city}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Date</p>
                                            <p className="font-mono flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {new Date(booking.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Time</p>
                                            <p className="font-mono flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-purple-400" />
                                                {booking.time}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Duration</p>
                                            <p>{booking.duration}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Price</p>
                                            <div className="flex flex-col">
                                                <p className="text-green-400 font-bold">₹{booking.totalPrice}</p>
                                                {booking.paymentStatus === 'PAID' && (
                                                    <span className="text-[10px] text-gray-500 font-mono mt-1">Ref: {booking.paymentId}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col items-center gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            {booking.paymentStatus === 'PAID' && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor('PAID')} flex items-center gap-1`}>
                                                    <CreditCard className="w-3 h-3" /> PAID
                                                </span>
                                            )}
                                        </div>

                                        {isPassenger && booking.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancel(booking._id)}
                                                disabled={cancelling === booking._id}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                title="Cancel Booking"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}

                                        {isPassenger && booking.status === 'COMPLETED' && !booking.review && (
                                            <button
                                                onClick={() => setReviewing(booking._id)}
                                                className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500/20 transition-colors text-sm font-bold"
                                            >
                                                Review
                                            </button>
                                        )}

                                        {isPassenger && booking.status === 'ACCEPTED' && booking.paymentStatus !== 'PAID' && (
                                            <button
                                                onClick={() => {
                                                    setCheckoutBooking(booking);
                                                    setPaymentStatus("idle");
                                                }}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-500/20"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Pay ₹{booking.totalPrice} Now
                                            </button>
                                        )}

                                        {isPassenger && booking.status === 'ACCEPTED' && booking.paymentStatus === 'PAID' && (
                                            <div className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Ready for Trip
                                            </div>
                                        )}

                                        {booking.status === 'ACCEPTED' && (
                                            <button
                                                onClick={() => setActiveChat({
                                                    id: booking._id,
                                                    name: participant?.name || "User"
                                                })}
                                                className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                title="Chat with Participant"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                        )}

                                        {booking.review && (
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star className="w-4 h-4 fill-yellow-500" />
                                                <span className="font-bold">{booking.review.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Chat Sidebar/Modal */}
            <AnimatePresence>
                {activeChat && (
                    <BookingChat
                        bookingId={activeChat.id}
                        recipientName={activeChat.name}
                        onClose={() => setActiveChat(null)}
                    />
                )}
            </AnimatePresence>

            {/* Review Modal */}
            {reviewing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                    >
                        <h3 className="text-xl font-bold mb-4">Rate your experience</h3>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setRating(s)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${s <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-6 resize-none focus:border-blue-500 focus:outline-none"
                            rows={3}
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => setReviewing(null)}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                disabled={submittingReview}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold disabled:opacity-50"
                            >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Payment Checkout Overlay */}
            <AnimatePresence>
                {checkoutBooking && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            {paymentStatus !== "success" && (
                                <button
                                    onClick={() => setCheckoutBooking(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10 text-gray-400"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            )}

                            <div className="p-6">
                                {paymentStatus === "idle" || paymentStatus === "processing" ? (
                                    <div className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h2 className="text-2xl font-bold font-mono">Complete Payment</h2>
                                            <p className="text-gray-400 text-sm">You are booking a trip with {checkoutBooking.guideId?.name}</p>
                                        </div>

                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-400">Booking Summary</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold uppercase tracking-wider">Demo Mode</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Guide:</span>
                                                    <span className="text-gray-300 font-medium">{checkoutBooking.guideId?.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Schedule:</span>
                                                    <span className="text-gray-300 font-medium">{new Date(checkoutBooking.date).toLocaleDateString()} @ {checkoutBooking.time}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Duration:</span>
                                                    <span className="text-gray-300 font-medium">{checkoutBooking.duration}</span>
                                                </div>
                                                <div className="border-t border-white/10 my-2 pt-2 flex justify-between">
                                                    <span className="text-white font-bold">Total Amount:</span>
                                                    <span className="text-green-400 font-bold text-lg">₹{checkoutBooking.totalPrice}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-center text-sm text-gray-400 px-4">
                                                Clicking "Pay Now" will simulate a payment and confirm your booking instantly.
                                            </p>

                                            <button
                                                onClick={() => handlePayment(checkoutBooking._id, checkoutBooking.totalPrice)}
                                                disabled={paymentStatus === "processing"}
                                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                                            >
                                                {paymentStatus === "processing" ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> Simulating Payment...</>
                                                ) : (
                                                    <><CreditCard className="w-5 h-5" /> Pay ₹{checkoutBooking.totalPrice} Now</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
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
                                            Your trip with <strong>{checkoutBooking.guideId?.name}</strong> is now fully confirmed and ready!
                                        </p>
                                        <button
                                            onClick={() => {
                                                setCheckoutBooking(null);
                                                setPaymentStatus("idle");
                                            }}
                                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            Done
                                        </button>
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
