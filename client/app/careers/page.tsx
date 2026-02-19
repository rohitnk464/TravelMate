"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code, ShieldCheck, Palette } from "lucide-react";

const positions = [
    {
        title: "Senior AI Engineer",
        team: "Engineering",
        type: "Remote / SF",
        icon: Code
    },
    {
        title: "Safety Operations Lead",
        team: "Trust & Safety",
        type: "London, UK",
        icon: ShieldCheck
    },
    {
        title: "Product Designer",
        team: "Design",
        type: "Remote",
        icon: Palette
    }
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background pt-20 pb-20">
            <section className="container mx-auto px-6 text-center mb-20">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4 inline-block">
                    We're Hiring
                </span>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">Build the Future of Safe Travel</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join a team passionate about using technology to make the world a safer, more accessible place for everyone.
                </p>
            </section>

            <section className="container mx-auto px-6 max-w-4xl">
                <div className="grid gap-6">
                    {positions.map((job, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-6 rounded-2xl bg-secondary/30 border border-white/5 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                                    <job.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{job.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span>{job.team}</span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 rounded-full border border-white/10 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground">
                        Don't see a role that fits? <a href="#" className="text-primary hover:underline">Email us your resume</a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
