"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

const posts = [
    {
        title: "Top 10 Safe Destinations for Solo Female Travelers",
        excerpt: "From Iceland to Japan, discover the countries leading the world in safety and inclusivity.",
        date: "Oct 12, 2025",
        author: "Sarah Jenkins",
        category: "Safety Guide",
        image: "https://images.unsplash.com/photo-1526772662000-3f88f107f5d8?q=80&w=2573&auto=format&fit=crop"
    },
    {
        title: "How AI is Revolutionizing Emergency Response",
        excerpt: "A deep dive into how TravelMate's predictive algorithms are preventing incidents before they happen.",
        date: "Oct 08, 2025",
        author: "Dr. Alex Chen",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
    },
    {
        title: "The Ultimate Guide to Offline Travel",
        excerpt: "Don't let spotty signal ruin your trip. Here's how to stay safe and connected without coverage.",
        date: "Sep 28, 2025",
        author: "Mike Ross",
        category: "Tips & Tricks",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop"
    }
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <section className="container mx-auto px-6 text-center mb-20">
                <span className="text-primary font-medium tracking-wider uppercase mb-2 block">The TravelMate Blog</span>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">Stories from the Road</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Insights, tips, and tales to inspire your next safe adventure.
                </p>
            </section>

            <section className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <motion.article
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group rounded-3xl overflow-hidden bg-secondary/30 border border-white/5 hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    unoptimized
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
                                    {post.category}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-6 flex-grow">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-primary font-bold text-sm mt-auto">
                                    Read Article <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </section>
        </div>
    );
}
