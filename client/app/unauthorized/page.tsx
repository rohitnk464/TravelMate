"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-6 bg-red-500/10 rounded-full border border-red-500/20">
                        <ShieldX className="w-16 h-16 text-red-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-3">Access Denied</h1>
                <p className="text-gray-400 mb-8">
                    You don&apos;t have permission to access this page. Please log in with the correct account type.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/login">
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </button>
                    </Link>
                    <Link href="/">
                        <button className="px-6 py-3 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-colors">
                            Go Home
                        </button>
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
