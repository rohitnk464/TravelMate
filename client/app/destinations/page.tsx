"use client";

import Navbar from "@/components/layout/Navbar";

import Destinations from "@/components/features/Destinations";
import { motion } from "framer-motion";

export default function DestinationsPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-6 px-6 container mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                        Explore the World
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        Browse our curated list of safe, exciting, and verified destinations for your next journey.
                    </p>
                </motion.div>
            </section>

            {/* Reusing the Destinations Component (which contains the grid) */}
            <div className="mt-10">
                <Destinations />
            </div>


        </main>
    );
}
