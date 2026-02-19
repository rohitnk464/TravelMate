"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";

type Role = "USER" | "GUIDE";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>("USER");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: selectedRole }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Registration failed");

            if (selectedRole === "GUIDE") {
                setSuccess("Account created! Your guide account is pending admin approval. You'll be notified once approved.");
            } else {
                login(
                    { id: data._id, name: data.name, email: data.email, role: data.role, isVerified: data.isVerified },
                    data.token
                );
                router.push("/");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                    Start Your Journey
                </h1>
                <p className="text-muted-foreground text-sm">
                    Join thousands of safe travelers worldwide.
                </p>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
                <p className="text-xs font-medium text-gray-300 mb-3 ml-1">Register as:</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: "USER" as Role, label: "Traveler", icon: <User className="w-4 h-4" /> },
                        { value: "GUIDE" as Role, label: "Guide", icon: <Compass className="w-4 h-4" /> },
                    ].map((role) => (
                        <button
                            key={role.value}
                            type="button"
                            onClick={() => setSelectedRole(role.value)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${selectedRole === role.value
                                ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                                }`}
                        >
                            {role.icon}
                            {role.label}
                        </button>
                    ))}
                </div>
                {selectedRole === "GUIDE" && (
                    <p className="text-xs text-yellow-400/80 mt-2 ml-1">
                        ⚠ Guide accounts require admin approval before login.
                    </p>
                )}
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-3 rounded-xl">
                        {success}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder:text-gray-500"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300 ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder:text-gray-500"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder:text-gray-500"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !!success}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6 shadow-lg shadow-purple-500/25 disabled:opacity-60"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Create Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium hover:underline">
                    Sign In
                </Link>
            </div>
        </motion.div>
    );
}
