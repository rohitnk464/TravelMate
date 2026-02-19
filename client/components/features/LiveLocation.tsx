"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Share2, ShieldCheck, Battery } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";

export default function LiveLocation() {
  const { user } = useAuth();
  const socket = useSocket();
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>("Locating...");

  useEffect(() => {
    let watchId: number;

    if (isSharing && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLoc = { lat: latitude, lng: longitude };
          setLocation(newLoc);

          let currentAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            currentAddress = data.display_name || currentAddress;
            setAddress(currentAddress);
          } catch (e) {
            setAddress(currentAddress);
          }

          // Emit to socket for admin
          if (socket && user) {
            socket.emit('update_location', {
              userId: user.id || user._id,
              name: user.name,
              location: newLoc,
              address: currentAddress
            });
          }
        },
        (error) => {
          console.error("Error watching location:", error);
          setAddress("Location access denied");
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharing, socket, user]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Live Location
          </h3>
          <p className="text-sm text-gray-400">
            {isSharing ? `Sharing ${address} with trusted contacts.` : "Location sharing is off."}
          </p>
        </div>
        <button
          onClick={() => {
            const nextSharingState = !isSharing;
            setIsSharing(nextSharingState);
            if (!nextSharingState && socket && user) {
              socket.emit('stop_sharing', user.id || user._id);
            }
          }}
          className={`px-6 py-2 rounded-full font-bold transition-all ${isSharing
            ? "bg-accent text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]"
            : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
        >
          {isSharing ? "Stop Sharing" : "Start Sharing"}
        </button>
      </div>

      {/* Real Map Visualization */}
      <div className="relative h-64 bg-secondary/50 rounded-2xl overflow-hidden border border-white/5 group">
        {location ? (
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
            className={`transition-opacity duration-500 ${isSharing ? 'opacity-100' : 'opacity-40 grayscale'}`}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-500"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop")',
              filter: isSharing ? 'none' : 'grayscale(100%)'
            }}
          />
        )}

        {/* Radar Effect */}
        {isSharing && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 3], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 bg-accent/30 rounded-full"
            />
          </div>
        )}

        {/* User Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_10px_#f43f5e] z-10 relative" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-accent/20 rounded-full animate-ping" />
          </div>
        </div>

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-white/80">
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md backdrop-blur-md">
            <ShieldCheck className="w-3 h-3 text-green-400" />
            <span>{isSharing ? `LAT: ${location?.lat.toFixed(4)} LNG: ${location?.lng.toFixed(4)}` : "OFFLINE"}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md backdrop-blur-md">
            <Share2 className="w-3 h-3 text-white" />
            <span>SECURE LINK ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Share Link */}
      {isSharing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-xl"
        >
          <Share2 className="w-4 h-4 text-accent" />
          <span className="text-sm text-accent truncate">https://travelmate.ai/track/user-{user?._id?.slice(-6) || "123456"}</span>
          <button className="ml-auto text-xs bg-accent text-white px-3 py-1 rounded-lg">Copy</button>
        </motion.div>
      )}
    </div>
  );
}
