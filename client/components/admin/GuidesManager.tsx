"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function GuidesManager() {
    const [guides, setGuides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        hourlyRate: "",
        bio: "",
        languages: "",
        imageUrl: ""
    });

    const fetchGuides = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/guides`);
            const data = await res.json();
            setGuides(data);
        } catch (error) {
            console.error("Failed to fetch guides", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/guides/${id}`, { method: "DELETE" });
            fetchGuides();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/guides/${id}/verify`, { method: "PATCH" });
            fetchGuides();
        } catch (error) {
            console.error("Failed to verify", error);
        }
    };

    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("location", formData.location);
            data.append("hourlyRate", formData.hourlyRate);
            data.append("bio", formData.bio);
            data.append("languages", formData.languages);

            if (file) {
                data.append("image", file);
            } else if (formData.imageUrl) {
                data.append("imageUrl", formData.imageUrl);
            }

            await fetch(`${API_BASE_URL}/api/guides`, {
                method: "POST",
                // No Content-Type header needed for FormData
                body: data
            });
            setShowForm(false);
            setFormData({ name: "", location: "", hourlyRate: "", bio: "", languages: "", imageUrl: "" });
            setFile(null);
            fetchGuides();
        } catch (error) {
            console.error("Failed to create", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <h2 className="text-xl font-bold text-white">Manage Guides & Uploads</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Guide
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Name"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Location"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Rate (e.g. $50/hr)"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.hourlyRate}
                            onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Languages (comma separated)"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.languages}
                            onChange={e => setFormData({ ...formData, languages: e.target.value })}
                            required
                        />

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm text-gray-400">Profile Image (Upload OR URL)</label>
                            <div className="flex gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white flex-1 select-none"
                                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                />
                                <input
                                    placeholder="Or paste Image URL"
                                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white flex-1"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    disabled={!!file}
                                />
                            </div>
                        </div>

                        <textarea
                            placeholder="Bio"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white col-span-2 h-24"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium">Save Guide</button>
                    </div>
                </form>
            )}

            <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Rate</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : guides.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No guides found.</td></tr>
                        ) : (
                            guides.map((guide) => (
                                <tr key={guide._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white">{guide.name}</td>
                                    <td className="p-4 text-gray-400">{guide.location}</td>
                                    <td className="p-4 text-gray-400">{guide.hourlyRate}</td>
                                    <td className="p-4">
                                        {guide.verified ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-500/10 px-2 py-1 rounded-full">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleVerify(guide._id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                            title="Toggle Verify"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(guide._id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
