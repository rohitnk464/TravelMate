"use client";

import { useState, useEffect } from "react";
import { User, Shield, Bell, Lock, LogOut, Image as ImageIcon, Upload, Link as LinkIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/config";

export default function ProfilePage() {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // User basic info state
    const [userData, setUserData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "+1 234 567 890", // Placeholder
        profileImage: user?.profileImage || ""
    });

    // Guide professional info state
    const [guideData, setGuideData] = useState({
        location: "",
        bio: "",
        hourlyRate: "",
        languages: "",
        imageUrl: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(user?.profileImage || "");
    const [trustedContacts, setTrustedContacts] = useState<{ name: string; phone: string }[]>([]);

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name || "",
                email: user.email || "",
                phone: "+1 234 567 890",
                profileImage: user.profileImage || ""
            });
            setPreviewUrl(user.profileImage || "");
            setTrustedContacts(user.trustedContacts || []);

            if (user.role === 'GUIDE') {
                fetchGuideProfile();
            }
        }
    }, [user]);

    // Handle image file change
    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [imageFile]);

    // Handle URL change
    const handleUrlChange = (url: string) => {
        setUserData({ ...userData, profileImage: url });
        if (!imageFile) {
            setPreviewUrl(url);
        }
    };

    const fetchGuideProfile = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/guides/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGuideData({
                    location: data.location || "",
                    bio: data.bio || "",
                    hourlyRate: data.hourlyRate?.toString() || "",
                    languages: Array.isArray(data.languages) ? data.languages.join(", ") : "",
                    imageUrl: data.imageUrl || ""
                });
            }
        } catch (err) {
            console.error("Error fetching guide profile:", err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Update Basic User Profile (Name & Image)
            const userFormData = new FormData();
            userFormData.append('name', userData.name);
            userFormData.append('profileImage', userData.profileImage);
            if (imageFile) {
                userFormData.append('image', imageFile);
            }

            const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: userFormData
            });

            if (!profileRes.ok) throw new Error("Failed to update base profile");
            let updatedUser = await profileRes.json();

            // 2. Update Trusted Contacts (Safety Settings)
            if (activeTab === 'safety' || trustedContacts.length > 0) {
                const contactsRes = await fetch(`${API_BASE_URL}/api/auth/contacts`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ contacts: trustedContacts })
                });

                if (!contactsRes.ok) throw new Error("Failed to update trusted contacts");
                const contactsData = await contactsRes.json();
                updatedUser.trustedContacts = contactsData.trustedContacts;
            }

            // 3. If guide, save guide-specific profile
            if (user?.role === 'GUIDE') {
                const guideFormData = new FormData();
                guideFormData.append('location', guideData.location);
                guideFormData.append('bio', guideData.bio);
                guideFormData.append('hourlyRate', guideData.hourlyRate);
                guideFormData.append('languages', guideData.languages);
                guideFormData.append('imageUrl', guideData.imageUrl);
                if (imageFile) guideFormData.append('image', imageFile);

                const guideRes = await fetch(`${API_BASE_URL}/api/guides`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: guideFormData
                });

                if (!guideRes.ok) throw new Error("Failed to update guide profile");
            }

            // Update Auth Context / LocalStorage
            localStorage.setItem('user', JSON.stringify({
                ...user,
                name: updatedUser.name,
                profileImage: updatedUser.profileImage,
                trustedContacts: updatedUser.trustedContacts
            }));

            alert("Profile updated successfully!");
            window.location.reload();
        } catch (err: any) {
            console.error("Error saving profile:", err);
            alert(err.message || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "safety", label: "Safety Settings", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    if (!user) return <div className="p-12 text-center">Please log in to view settings.</div>;

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and safety preferences.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Tabs */}
                    <nav className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all mt-8"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </nav>

                    {/* Content Area */}
                    <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[400px]">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "profile" && (
                                <div className="space-y-8">
                                    <section className="space-y-6">
                                        <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Personal Information</h2>

                                        {/* Premium Photo Upload Section */}
                                        <div className="flex flex-col md:flex-row items-center gap-8 pb-6 border-b border-white/5">
                                            <div className="relative group">
                                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-black/40 flex items-center justify-center shadow-2xl relative">
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl.startsWith('/') ? `${API_BASE_URL}${previewUrl}` : previewUrl}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-12 h-12 text-gray-600" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                        <Upload className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    id="image-upload-direct"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setImageFile(file);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-4 w-full">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-1">Your Profile Photo</h3>
                                                    <p className="text-xs text-muted-foreground">This helps guides and travelers recognize you. JPG, PNG are supported.</p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <label
                                                        htmlFor="image-upload-direct"
                                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer text-sm font-medium"
                                                    >
                                                        <ImageIcon className="w-4 h-4" /> Device
                                                    </label>
                                                    <div className="relative group">
                                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            placeholder="Paste image URL..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:border-primary outline-none"
                                                            value={userData.profileImage}
                                                            onChange={e => handleUrlChange(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={userData.name}
                                                    onChange={e => setUserData({ ...userData, name: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
                                                <input
                                                    type="email"
                                                    disabled
                                                    value={userData.email}
                                                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-gray-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {user.role === 'GUIDE' && (
                                        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <h2 className="text-xl font-semibold border-b border-white/10 pb-4 text-blue-400">Professional Details</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">City / Location</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Kyoto, Japan"
                                                        value={guideData.location}
                                                        onChange={e => setGuideData({ ...guideData, location: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Hourly Rate ($)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 50"
                                                        value={guideData.hourlyRate}
                                                        onChange={e => setGuideData({ ...guideData, hourlyRate: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Languages</label>
                                                    <input
                                                        type="text"
                                                        placeholder="English, Japanese, Hindi"
                                                        value={guideData.languages}
                                                        onChange={e => setGuideData({ ...guideData, languages: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                                                    />
                                                </div>

                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Bio</label>
                                                    <textarea
                                                        rows={4}
                                                        placeholder="Write a short professional bio..."
                                                        value={guideData.bio}
                                                        onChange={e => setGuideData({ ...guideData, bio: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <div className="pt-4 sticky bottom-0 bg-background/50 backdrop-blur-sm py-4 border-t border-white/10">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                            ) : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "safety" && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Safety Preferences</h2>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
                                        <Shield className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-medium text-red-200">Emergency SOS</h3>
                                            <p className="text-sm text-red-200/60 mt-1">
                                                Configure your trusted contacts who will be notified when you activate SOS mode.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Trusted Contacts</h3>
                                        <div className="space-y-2">
                                            {trustedContacts.map((contact, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Contact Name"
                                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none"
                                                        value={contact.name}
                                                        onChange={(e) => {
                                                            const newContacts = [...trustedContacts];
                                                            newContacts[index].name = e.target.value;
                                                            setTrustedContacts(newContacts);
                                                        }}
                                                    />
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone Number"
                                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none"
                                                        value={contact.phone}
                                                        onChange={(e) => {
                                                            const newContacts = [...trustedContacts];
                                                            newContacts[index].phone = e.target.value;
                                                            setTrustedContacts(newContacts);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newContacts = trustedContacts.filter((_, i) => i !== index);
                                                            setTrustedContacts(newContacts);
                                                        }}
                                                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                        title="Remove Contact"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {trustedContacts.length < 3 && (
                                                <button
                                                    onClick={() => setTrustedContacts([...trustedContacts, { name: "", phone: "" }])}
                                                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Contact
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Placeholders for other tabs */}
                            {["security", "notifications"].includes(activeTab) && (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Lock className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-300">Coming Soon</h3>
                                    <p className="text-sm text-gray-500 max-w-xs mt-2">
                                        These settings will be available in the next update.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
