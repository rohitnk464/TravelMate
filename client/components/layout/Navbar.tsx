"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, ShieldCheck, Globe, LogOut, LayoutDashboard, MessageSquare, Bell } from "lucide-react";
import { io } from "socket.io-client";
import { cn } from "@/lib/utils";
import { useJourney } from "@/context/JourneyContext";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import BookingChat from "@/components/features/BookingChat";

const Navbar = () => {
    const { isSafetyMode, toggleSafetyMode } = useJourney();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMessagesOpen, setIsMessagesOpen] = useState(false);
    const [activeBookings, setActiveBookings] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);
    const { user, isAuthenticated, logout, token } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isAuthenticated && token && user) {
            const fetchActiveBookings = async () => {
                try {
                    let fetchUrl = `http://localhost:5000/api/bookings/user/${user?.id}`;
                    if (user?.role === 'GUIDE') {
                        const guideRes = await fetch('http://localhost:5000/api/guides/me', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (guideRes.ok) {
                            const guideData = await guideRes.json();
                            fetchUrl = `http://localhost:5000/api/bookings/guide/${guideData._id}`;
                        }
                    }
                    const res = await fetch(fetchUrl, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    setActiveBookings(data.filter((b: any) => b.status === 'ACCEPTED'));
                } catch (error) {
                    console.error("Navbar chat fetch failed:", error);
                }
            };
            fetchActiveBookings();

            // Real-time notifications
            const socket = io("http://localhost:5000");
            socket.emit("join_user", user.id);
            socket.on("new_notification", (notif) => {
                console.log("🔔 New Notification:", notif);
                alert(`${notif.message}`); // Simple alert for demo
                fetchActiveBookings(); // Refresh bookings list
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [isAuthenticated, token, user]);

    const userNavLinks = [
        { name: "Destinations", href: "/destinations" },
        { name: "Guides", href: "/guides" },
        { name: "Safety", href: "/safety" },
        { name: "My Bookings", href: "/my-bookings" },
    ];

    const guideNavLinks = [
        { name: "Dashboard", href: "/guide/dashboard" },
        { name: "Bookings", href: "/my-bookings" },
    ];

    const adminNavLinks = [
        { name: "Dashboard", href: "/admin/dashboard?tab=overview" },
        { name: "Users", href: "/admin/dashboard?tab=users" },
        { name: "Guides", href: "/admin/dashboard?tab=guides" },
        { name: "Bookings", href: "/admin/dashboard?tab=bookings" },
    ];

    const navLinks = !isAuthenticated
        ? [
            { name: "Destinations", href: "/destinations" },
            { name: "Guides", href: "/guides" },
            { name: "Safety", href: "/safety" },
        ]
        : user?.role === "ADMIN"
            ? adminNavLinks
            : user?.role === "GUIDE"
                ? guideNavLinks
                : userNavLinks;

    const getDashboardHref = () => {
        if (user?.role === "ADMIN") return "/admin/dashboard";
        if (user?.role === "GUIDE") return "/guide/dashboard";
        return "/destinations";
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (pathname?.startsWith("/dashboard")) return null;

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-white/10 py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-purple-500/20"></div>
                        <div className="absolute inset-0 bg-black/20 rounded-xl backdrop-blur-sm group-hover:bg-transparent transition-colors"></div>
                        <Globe className="relative w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
                            TravelMate
                        </span>
                        <span className="text-[10px] font-medium text-blue-400 tracking-widest uppercase">
                            Safety First
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (pathname !== "/" && pathname?.startsWith(link.href));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors relative",
                                    isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                <Link href={getDashboardHref()}>
                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/5 transition-colors">
                                        <LayoutDashboard className="w-4 h-4 text-blue-400" />
                                        {user?.name?.split(" ")[0]}
                                    </button>
                                </Link>
                                <div className="w-[1px] h-4 bg-white/10" />
                                <Link href="/settings">
                                    <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                                        Settings
                                    </button>
                                </Link>
                            </div>
                            <div className="relative group">
                                <button
                                    onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                                    className="p-2 text-gray-400 hover:text-blue-400 transition-colors relative"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    {activeBookings.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-background"></span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isMessagesOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                                        >
                                            <div className="p-4 border-b border-white/10 bg-white/5">
                                                <h3 className="text-sm font-bold text-white">Active Chats</h3>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {activeBookings.length === 0 ? (
                                                    <div className="p-8 text-center bg-white/5">
                                                        <MessageSquare className="w-8 h-8 mx-auto text-gray-600 mb-2 opacity-50" />
                                                        <p className="text-xs text-gray-500">No active chats yet.</p>
                                                    </div>
                                                ) : (
                                                    activeBookings.map((booking) => (
                                                        <button
                                                            key={booking._id}
                                                            onClick={() => {
                                                                setActiveChat({
                                                                    id: booking._id,
                                                                    name: user?.role === 'GUIDE' ? booking.userId?.name : booking.guideId?.name
                                                                });
                                                                setIsMessagesOpen(false);
                                                            }}
                                                            className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                                                <span className="text-xs font-bold text-blue-400">
                                                                    {(user?.role === 'GUIDE' ? booking.userId?.name : booking.guideId?.name)?.[0]}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-bold text-white truncate">
                                                                    {user?.role === 'GUIDE' ? booking.userId?.name : booking.guideId?.name}
                                                                </h4>
                                                                <p className="text-[10px] text-gray-500 truncate">Booking ID: {booking._id.slice(-6)}</p>
                                                            </div>
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            <Link
                                                href="/my-bookings"
                                                className="block p-3 text-center text-[10px] font-bold text-blue-400 hover:bg-white/5 transition-colors border-t border-white/10 bg-white/5 uppercase tracking-wider"
                                                onClick={() => setIsMessagesOpen(false)}
                                            >
                                                View All Bookings
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login">
                            <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                                Log In
                            </button>
                        </Link>
                    )}
                    <button
                        onClick={toggleSafetyMode}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg flex items-center gap-2 border ${isSafetyMode
                            ? "bg-red-500 border-red-400 text-white hover:bg-red-600 shadow-red-500/25"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-black/20"
                            }`}
                    >
                        {isSafetyMode ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4 text-blue-400" />}
                        {isSafetyMode ? "Safety Active" : "Safety Mode"}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 md:hidden p-6 shadow-2xl"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href || (pathname !== "/" && pathname?.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "text-lg font-medium py-2 transition-colors",
                                            isActive ? "text-primary font-bold pl-2 border-l-2 border-primary" : "text-foreground"
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                            <hr className="border-white/10 my-2" />
                            {isAuthenticated ? (
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            ) : (
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <button className="w-full py-3 rounded-xl bg-secondary text-white font-medium">
                                        Log In
                                    </button>
                                </Link>
                            )}
                            <button className="w-full py-3 rounded-xl bg-primary text-white font-medium flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4" />
                                Enable Safety Mode
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Chat Modal */}
            <AnimatePresence>
                {activeChat && (
                    <BookingChat
                        bookingId={activeChat.id}
                        recipientName={activeChat.name}
                        onClose={() => setActiveChat(null)}
                    />
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
