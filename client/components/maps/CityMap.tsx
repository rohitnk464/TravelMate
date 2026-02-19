"use client";

import { useEffect, useState, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, LayersControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useJourney } from "@/context/JourneyContext";
import { Navigation, Layers, Shield, Utensils, Camera, Hotel } from "lucide-react";

// Fix for default markers in Next.js
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Custom Emojis for markers
const createIcon = (type: string, isSelected: boolean) => {
    let emoji = "📍";
    let bg = "bg-blue-500";

    if (type === "food") { emoji = "🍴"; bg = "bg-orange-500"; }
    else if (type === "attraction") { emoji = "📸"; bg = "bg-purple-500"; }
    else if (type === "police") { emoji = "👮"; bg = "bg-blue-700"; }
    else if (type === "hospital") { emoji = "🏥"; bg = "bg-red-500"; }
    else if (type === "safety") { emoji = "🛡️"; bg = "bg-green-500"; }
    else if (type === "hotel") { emoji = "🏨"; bg = "bg-indigo-500"; }

    const pulseClass = isSelected ? "animate-bounce ring-4 ring-white" : "hover:scale-110";

    return L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 rounded-full ${bg} border-2 border-white shadow-lg flex items-center justify-center text-lg transform transition-transform ${pulseClass}">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

// User Location Icon
const userIcon = L.divIcon({
    className: "user-marker",
    html: `<div class="relative w-4 h-4">
            <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
           </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

// Component to handle map movements
const MapController = ({ center, markers, selectedId }: { center: [number, number], markers: any[], selectedId: string | null }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedId) {
            const marker = markers.find(m => m.id === selectedId);
            if (marker) {
                map.flyTo([marker.lat, marker.lng], 16, { duration: 1.5 });
                return;
            }
        }

        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        } else {
            map.flyTo(center, 13, { duration: 1.5 });
        }
    }, [center, markers, map, selectedId]);

    return null;
};

import { CITY_COORDINATES } from "@/lib/constants";

const CityMap = () => {
    const { mapMarkers, routePolyline, isSafetyMode, selectedCity, selectedMarkerId, setSelectedMarkerId, selectedCityCoordinates } = useJourney();
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");

    const categories = [
        { id: "all", label: "All", icon: Layers },
        { id: "food", label: "Food", icon: Utensils },
        { id: "attraction", label: "Sights", icon: Camera },
        { id: "hotel", label: "Hotels", icon: Hotel },
        { id: "safety", label: "Safety", icon: Shield },
    ];

    const filteredMarkers = mapMarkers.filter(m => {
        if (activeCategory === "all") return true;
        if (activeCategory === "safety") return m.type === "police" || m.type === "hospital" || m.type === "safety";
        return m.type === activeCategory;
    });

    // Default center (London) if no markers or user location
    const defaultCenter: [number, number] = [51.505, -0.09];

    // Priority: selectedCityCoordinates > mapMarkers > userLocation > default
    const getMapCenter = (): [number, number] => {
        if (selectedCityCoordinates) return selectedCityCoordinates;

        if (selectedCity) {
            const normalizedSelected = selectedCity.toLowerCase();
            // Try specific match first
            if (CITY_COORDINATES[selectedCity]) return CITY_COORDINATES[selectedCity];

            // Search through keys for partial matches
            const cityKey = Object.keys(CITY_COORDINATES).find(key =>
                normalizedSelected.includes(key.toLowerCase()) ||
                key.toLowerCase().includes(normalizedSelected)
            );

            if (cityKey) return CITY_COORDINATES[cityKey];
        }

        if (mapMarkers.length > 0) return [mapMarkers[0].lat, mapMarkers[0].lng] as [number, number];
        if (userLocation) return userLocation;
        return defaultCenter;
    };

    const mapCenter = getMapCenter();

    // Mock Safety Zones (Circles)
    const showSafetyZones = isSafetyMode || activeCategory === "safety";
    const safetyZones = showSafetyZones ? [
        { lat: mapCenter[0] + 0.01, lng: mapCenter[1] + 0.01, radius: 500, color: "green" },
        { lat: mapCenter[0] - 0.01, lng: mapCenter[1] - 0.01, radius: 300, color: "red" }
    ] : [];

    useEffect(() => {
        // Get User Location & Watch
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.error("Loc error", err)
            );
        }

        // Live Location Simulation (jitter)
        const interval = setInterval(() => {
            setUserLocation(prev => {
                if (!prev) return prev;
                // Add tiny random movement (approx 5-10 meters)
                return [
                    prev[0] + (Math.random() - 0.5) * 0.0001,
                    prev[1] + (Math.random() - 0.5) * 0.0001
                ];
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full outline-none"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={isSafetyMode
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />

                <MapController center={mapCenter} markers={mapMarkers} selectedId={selectedMarkerId} />

                {/* User Location */}
                {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {/* Floating Filters */}
                <div className="absolute top-36 left-4 z-[400] flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-xl border border-white/20 flex flex-col gap-1">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold w-full
                                    ${activeCategory === cat.id
                                        ? "bg-blue-600 text-white shadow-md transform scale-105"
                                        : "hover:bg-gray-100 text-gray-600"}
                                `}
                            >
                                <cat.icon className="w-4 h-4" />
                                <span className="hidden md:inline">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Safety Zones Overlays */}
                <LayersControl position="topright">
                    <LayersControl.Overlay checked={showSafetyZones} name="Safety Zones">
                        <>
                            {safetyZones.map((zone, idx) => (
                                <Circle
                                    key={idx}
                                    center={[zone.lat, zone.lng]}
                                    radius={zone.radius}
                                    pathOptions={{
                                        color: zone.color,
                                        fillColor: zone.color,
                                        fillOpacity: 0.2,
                                        weight: 1
                                    }}
                                />
                            ))}
                        </>
                    </LayersControl.Overlay>
                </LayersControl>

                {/* Route Polyline */}
                {routePolyline && (
                    <Polyline
                        positions={typeof routePolyline !== 'string' && routePolyline.coordinates ? routePolyline.coordinates.map((c: any) => [c[1], c[0]]) : []}
                        pathOptions={{
                            color: isSafetyMode ? "#10b981" : "#3b82f6",
                            weight: 5,
                            opacity: 0.8,
                        }}
                    />
                )}

                {/* Markers with Clustering */}
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={40}
                    spiderfyOnMaxZoom={true}
                    polygonOptions={{
                        fillColor: '#3b82f6',
                        color: '#3b82f6',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.3,
                    }}
                >
                    {filteredMarkers.map((marker) => (
                        <Marker
                            key={marker.id}
                            position={[marker.lat, marker.lng]}
                            icon={createIcon(marker.type, marker.id === selectedMarkerId)}
                            eventHandlers={{
                                click: () => setSelectedMarkerId(marker.id),
                            }}
                        >
                            <Popup>
                                <div className="font-sans min-w-[200px]">
                                    <h3 className="font-bold text-sm mb-1">{marker.label}</h3>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 uppercase tracking-tighter border border-gray-200">
                                            {marker.type}
                                        </span>
                                        {marker.details?.cuisine && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                                {marker.details.cuisine}
                                            </span>
                                        )}
                                        {marker.details?.rating && (
                                            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
                                                <span className="text-[10px]">⭐</span>
                                                <span className="text-xs font-bold text-yellow-700">{marker.details.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                    {marker.details?.address && (
                                        <div className="flex items-start gap-1 mb-1 text-xs text-gray-600">
                                            <span>📍</span>
                                            <span className="line-clamp-2">{marker.details.address}</span>
                                        </div>
                                    )}
                                    {marker.details?.hours && (
                                        <div className="flex items-start gap-1 mb-1 text-xs text-gray-600">
                                            <span>🕒</span>
                                            <span>{marker.details.hours}</span>
                                        </div>
                                    )}
                                    <div className="mt-3 flex gap-2">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-2 rounded text-center transition-colors shadow-sm"
                                        >
                                            Get Directions
                                        </a>
                                        {marker.details?.website && (
                                            <a
                                                href={marker.details.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded border border-gray-200 transition-colors shadow-sm"
                                            >
                                                Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Locate Me Button Overlay - Restored */}
            <button
                onClick={() => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                        });
                    }
                }}
                className="absolute bottom-24 right-4 z-[400] bg-white text-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                title="Locate Me"
            >
                <Navigation className="w-5 h-5" />
            </button>

            {/* User Location */}
        </div>
    );
};

export default memo(CityMap);
