"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./map-styles.css";
import { Skeleton } from "@/components/ui/skeleton";

// Fix for default Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Custom Teal Icon for PharmaHub
const TealIcon = L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: #14b8a6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(20, 184, 166, 0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

interface MapDisplayProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{ id: string; lat: number; lng: number; title?: string }>;
    className?: string;
}

// Helper component to handle center updates and resize issues
function MapControllers({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        // Force Leaflet to recalculate its container size
        // This is critical when the map is rendered inside toggles/containers that might shift
        setTimeout(() => {
            map.invalidateSize();
            map.setView(center, zoom, { animate: true });
        }, 100);
    }, [center, zoom, map]);

    return null;
}

export function MapDisplay({ center, zoom = 15, markers = [], className }: MapDisplayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Skeleton className={`w-full h-full rounded-xl ${className}`} />;
    }

    const centerPos: [number, number] = [center.lat, center.lng];

    return (
        <div className={`rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#020617] ${className} relative isolate min-h-[400px]`}>
            <MapContainer
                center={centerPos}
                zoom={zoom}
                scrollWheelZoom={false}
                className="w-full h-full absolute inset-0"
                style={{ height: '100%', width: '100%' }}
            >
                <MapControllers center={centerPos} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {markers.map((marker, idx) => (
                    <Marker
                        key={`${marker.id}-${idx}`}
                        position={[marker.lat, marker.lng]}
                        icon={TealIcon}
                    >
                        {marker.title && (
                            <Popup>
                                <div className="text-xs font-bold text-slate-900">{marker.title}</div>
                            </Popup>
                        )}
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
