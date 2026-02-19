"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Map, Shield, Users, Settings, LogOut, Globe, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: Map, label: "Explore", href: "/dashboard" },
    { icon: BookOpen, label: "Guides", href: "/guides" },
    { icon: Shield, label: "Safety Center", href: "/safety" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        handleResize(); // Check on mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <AnimatePresence>
            {(isOpen || isDesktop) && (
                <>
                    {/* Mobile Backdrop */}
                    <div
                        className={cn(
                            "md:hidden fixed inset-0 bg-black/50 z-40",
                            isOpen ? "block" : "hidden"
                        )}
                        onClick={onClose}
                    />

                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className={cn(
                            "fixed md:relative z-50 w-64 h-full bg-background border-r border-white/10 flex flex-col",
                            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                            "transition-transform duration-300 ease-in-out"
                        )}
                    >
                        <div className="p-6 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                    TravelMate
                                </span>
                            </Link>
                            <button onClick={onClose} className="md:hidden p-1 hover:bg-white/5 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400 group-hover:text-foreground")} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-white/5">
                            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
