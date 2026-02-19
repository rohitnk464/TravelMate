"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, MapPin } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function PlacesManager() {
    const [places, setPlaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        description: "",
        rating: "4.5",
        tags: "",
        safetyScore: "9.0",
        image: ""
    });

    const fetchPlaces = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/places`);
            const data = await res.json();
            setPlaces(data);
        } catch (error) {
            console.error("Failed to fetch places", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaces();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/places/${id}`, { method: "DELETE" });
            fetchPlaces();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const [file, setFile] = useState<File | null>(null);

    // ... existing handleDelete ...

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("location", formData.location);
            data.append("description", formData.description);
            data.append("rating", formData.rating);
            data.append("tags", formData.tags);
            data.append("safetyScore", formData.safetyScore);

            if (file) {
                data.append("image", file);
            } else if (formData.image) {
                data.append("image", formData.image);
            }

            const response = await fetch(`${API_BASE_URL}/api/places`, {
                method: "POST",
                body: data
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create place");
            }

            alert("Place added successfully!");
            setShowForm(false);
            setFormData({ name: "", location: "", description: "", rating: "4.5", tags: "", safetyScore: "9.0", image: "" });
            setFile(null);
            fetchPlaces();
        } catch (error: any) {
            console.error("Failed to create", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Manage Places & Uploads</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Place
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Place Name"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Location (Lat, Lng or Address)"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                        {/* ... description ... */}
                        <input
                            placeholder="Description"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white col-span-2"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />

                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <input
                                placeholder="Rating (0-5)"
                                className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.rating}
                                onChange={e => setFormData({ ...formData, rating: e.target.value })}
                            />
                            <input
                                placeholder="Safety Score (0-10)"
                                className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.safetyScore}
                                onChange={e => setFormData({ ...formData, safetyScore: e.target.value })}
                            />
                        </div>

                        <input
                            placeholder="Tags (comma separated)"
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white col-span-2"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        />

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm text-gray-400">Image Source (Upload OR URL)</label>
                            <div className="flex gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white flex-1 user-select-none"
                                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                />
                                <input
                                    placeholder="Or paste Image URL"
                                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white flex-1"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    disabled={!!file}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Place"}
                        </button>
                    </div>
                </form>
            )}

            <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Safety</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : places.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No places found.</td></tr>
                        ) : (
                            places.map((place) => (
                                <tr key={place._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white">{place.name}</td>
                                    <td className="p-4 text-gray-400 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {place.location}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        <div className="flex gap-1">
                                            {place.tags && place.tags.slice(0, 2).map((t: string) => (
                                                <span key={t} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-green-400 font-mono">{place.safetyScore}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(place._id)}
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
