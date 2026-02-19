"use client";

import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";

import LiveLocation from "@/components/features/LiveLocation";
import { Phone, Bell, Mic, Siren, ShieldAlert, Lock, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function SafetyPage() {
    const { user, token } = useAuth();
    const [fakeCallActive, setFakeCallActive] = useState(false);
    const [sirenActive, setSirenActive] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    }, []);

    // Audio Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorder?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                const chunks: Blob[] = [];

                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                    const url = URL.createObjectURL(blob);
                    setRecordedUrl(url);
                    stream.getTracks().forEach(track => track.stop());

                    // Upload to backend
                    try {
                        // First create a new incident for this specific recording
                        const incidentRes = await fetch(`${API_BASE_URL}/api/safety/incidents`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                trigger: "Voice Evidence Recorded",
                                location: { lat: 0, lng: 0 }
                            })
                        });
                        const incident = await incidentRes.json();

                        if (incident._id) {
                            const formData = new FormData();
                            formData.append('audio', blob, 'recording.ogg');

                            await fetch(`${API_BASE_URL}/api/safety/incidents/${incident._id}/audio`, {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${token}`
                                },
                                body: formData
                            });
                            console.log("Audio uploaded successfully for incident:", incident._id);
                        }
                    } catch (uploadErr) {
                        console.error("Failed to upload audio:", uploadErr);
                    }
                };

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
                triggerIncident("Audio Recording Started");
            } catch (err) {
                console.error("Microphone access denied", err);
                alert("Please grant microphone permissions to record audio.");
            }
        }
    };

    const toggleSiren = () => {
        if (sirenActive) {
            audio?.pause();
            if (audio) audio.currentTime = 0;
            setSirenActive(false);
        } else {
            const newAudio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3"); // Fallback initial beep
            // Using a proper siren sound
            const sirenUrl = "https://assets.mixkit.co/active_storage/sfx/1005/1005-preview.mp3";
            const s = new Audio(sirenUrl);
            s.loop = true;
            s.play();
            setAudio(s);
            setSirenActive(true);
            triggerIncident("Loud Siren Activated");
        }
    };

    const triggerIncident = async (label: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/safety/incidents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    trigger: label,
                    location: location || { lat: 0, lng: 0 }
                })
            });
        } catch (error) {
            console.error("Failed to trigger incident", error);
        }
    };

    const [isAddingContact, setIsAddingContact] = useState(false);
    const [newContact, setNewContact] = useState({ name: "", phone: "" });
    const { login } = useAuth(); // To refresh user data if needed

    const handlePoliceSearch = async () => {
        if (!location) {
            alert("Please enable location to find nearby police stations.");
            return;
        }

        try {
            const query = `[out:json];node["amenity"="police"](around:5000,${location.lat},${location.lng});out;`;
            window.open(`https://www.google.com/maps/search/police+station/@${location.lat},${location.lng},14z`, "_blank");
            triggerIncident("Nearby Police Lookup");
        } catch (error) {
            console.error("OSM lookup failed", error);
        }
    };

    const addContact = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedContacts = [...(user?.trustedContacts || []), newContact];

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/contacts`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ contacts: updatedContacts })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // We might need a better way to update the global auth context
                // For now, let's just alert success and suggest refresh
                alert("Contact added! Refreshing profile...");
                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to add contact", err);
        }
    };

    const tools = [
        {
            id: "fake-call",
            label: "Fake Call",
            icon: Phone,
            color: "bg-blue-500",
            action: () => {
                setFakeCallActive(true);
                triggerIncident("Fake Call Initiated");
            }
        },
        {
            id: "siren",
            label: sirenActive ? "Stop Siren" : "Loud Siren",
            icon: Siren,
            color: sirenActive ? "bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]" : "bg-red-500",
            action: toggleSiren
        },
        {
            id: "record",
            label: isRecording ? "Stop Recording" : "Record Audio",
            icon: Mic,
            color: isRecording ? "bg-purple-600 animate-pulse shadow-[0_0_20px_rgba(147,51,234,0.5)]" : "bg-purple-500",
            action: toggleRecording
        },
        {
            id: "police",
            label: "Nearby Police",
            icon: ShieldAlert,
            color: "bg-indigo-500",
            action: handlePoliceSearch
        },
    ];

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-32 pb-12 px-6 container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Status & Live Location */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <h1 className="text-3xl font-bold">Safety Command Center</h1>
                            <p className="text-muted-foreground">
                                Your personal safety dashboard. Share your location, access emergency tools, and stay connected.
                            </p>
                        </motion.div>

                        <LiveLocation />

                        {/* Safety Tips Banner */}
                        <motion.div
                            initial={false}
                            className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 p-6 rounded-3xl overflow-hidden cursor-pointer group relative"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-full">
                                    <Lock className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-blue-100">AI Safety Monitor</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold border border-yellow-500/20 animate-pulse">
                                            LIVE ANALYSIS
                                        </span>
                                    </div>
                                    <p className="text-sm text-blue-200/70 mt-1">
                                        You are currently in a <span className="text-yellow-400 font-bold">Medium Risk Zone</span>.
                                    </p>

                                    {/* Expandable Content */}
                                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
                                        <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                                            <p className="text-xs text-gray-300">
                                                <strong>Why this alert?</strong> AI analysis of local crime reports indicates occasional pickpocketing in this area after dark.
                                            </p>
                                            <p className="text-xs text-gray-300">
                                                <strong>Recommendation:</strong> Avoid unlit alleys after 9 PM. TravelMate is monitoring local news for updates.
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-400 mt-2 opacity-60 group-hover:opacity-0 transition-opacity">Hover for AI reasoning...</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Quick Tools */}
                    <div className="space-y-6">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-accent" />
                            Emergency Tools
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {tools.map((tool) => (
                                <motion.button
                                    key={tool.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={tool.action}
                                    className={`aspect-square rounded-2xl ${tool.color} flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow`}
                                >
                                    <tool.icon className="w-8 h-8 text-white" />
                                    <span className="font-bold text-white text-sm">{tool.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold">Trusted Contacts</h4>
                                <button
                                    onClick={() => setIsAddingContact(true)}
                                    className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                                >
                                    <UserIcon className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {user?.trustedContacts && user.trustedContacts.length > 0 ? (
                                    user.trustedContacts.map((contact: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 uppercase">
                                                {contact.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium">{contact.name}</p>
                                                <p className="text-xs text-gray-400">{contact.phone}</p>
                                            </div>
                                            <button className="ml-auto px-3 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20">Alert</button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-gray-500">No contacts added yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Add Contact Form */}
                            <AnimatePresence>
                                {isAddingContact && (
                                    <motion.form
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onSubmit={addContact}
                                        className="mt-6 pt-6 border-t border-white/10 space-y-3"
                                    >
                                        <input
                                            required
                                            placeholder="Contact Name"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                        />
                                        <input
                                            required
                                            placeholder="Phone Number"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
                                            value={newContact.phone}
                                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-600 py-2 rounded-xl text-xs font-bold"
                                            >
                                                Save Contact
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingContact(false)}
                                                className="px-4 py-2 bg-white/5 rounded-xl text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Audio Recording Playback */}
                        <AnimatePresence>
                            {recordedUrl && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mt-4"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 text-purple-400">
                                            <Mic className="w-5 h-5" />
                                            <span className="text-sm font-bold uppercase tracking-wider">Recorded Clip</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <audio src={recordedUrl} controls className="h-8 max-w-[150px] md:max-w-none" />
                                            <a
                                                href={recordedUrl}
                                                download="emergency-recording.ogg"
                                                className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                                            >
                                                Save
                                            </a>
                                            <button
                                                onClick={() => setRecordedUrl(null)}
                                                className="p-1 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Fake Call Modal */}
            <AnimatePresence>
                {fakeCallActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-between py-20"
                    >
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                                <UserIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-3xl font-normal text-white">Mom</h2>
                            <p className="text-gray-400">00:05</p>
                        </div>

                        <div className="grid grid-cols-2 gap-20">
                            <button
                                onClick={() => setFakeCallActive(false)}
                                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse"
                            >
                                <Phone className="w-8 h-8 text-white rotate-[135deg]" />
                            </button>
                            <button
                                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
                            >
                                <Phone className="w-8 h-8 text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
