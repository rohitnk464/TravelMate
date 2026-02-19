"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, User, Compass, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";

type Role = "USER" | "GUIDE" | "ADMIN";

const roles: { value: Role; label: string; icon: React.ReactNode; description: string }[] = [
    { value: "USER", label: "Traveler", icon: <User className="w-4 h-4" />, description: "Explore destinations" },
    { value: "GUIDE", label: "Guide", icon: <Compass className="w-4 h-4" />, description: "Manage your tours" },
    { value: "ADMIN", label: "Admin", icon: <ShieldCheck className="w-4 h-4" />, description: "Platform management" },
];

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>("USER");
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Login failed");

            // Role mismatch check
            if (data.role !== selectedRole) {
                const roleLabels: Record<string, string> = {
                    USER: "Traveler",
                    GUIDE: "Guide",
                    ADMIN: "Admin",
                };
                throw new Error(
                    `This account is registered as a ${roleLabels[data.role]}. Please select the correct login type.`
                );
            }

            login(
                { id: data._id, name: data.name, email: data.email, role: data.role, isVerified: data.isVerified },
                data.token
            );

            if (data.role === "ADMIN") router.push("/admin/dashboard");
            else if (data.role === "GUIDE") router.push("/guide/dashboard");
            else router.push("/");
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
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                    Welcome Back
                </h1>
                <p className="text-muted-foreground text-sm">
                    Continue your journey with TravelMate.
                </p>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
                <p className="text-xs font-medium text-gray-300 mb-3 ml-1">Login as:</p>
                <div className="grid grid-cols-3 gap-2">
                    {roles.map((role) => (
                        <button
                            key={role.value}
                            type="button"
                            onClick={() => setSelectedRole(role.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${selectedRole === role.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                                }`}
                        >
                            {role.icon}
                            <span>{role.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 rotate-180 shrink-0" />
                        {error}
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-300 ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-gray-500"
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
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-gray-500"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Sign In as {roles.find(r => r.value === selectedRole)?.label}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium hover:underline">
                    Sign up
                </Link>
            </div>
        </motion.div>
    );
}
