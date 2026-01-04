"use client";

import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "./map-styles.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Target } from "lucide-react";

// Custom Teal Icon for Location Picker
const TealIcon = L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: #14b8a6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(20, 184, 166, 0.8);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

interface LocationPickerProps {
    defaultLocation?: { lat: number; lng: number };
    onLocationSelect: (lat: number, lng: number) => void;
}

const defaultCenter: [number, number] = [43.6532, -79.3832]; // Toronto

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export function LocationPicker({ defaultLocation, onLocationSelect }: LocationPickerProps) {
    const [mounted, setMounted] = useState(false);
    const [marker, setMarker] = useState<[number, number] | null>(
        defaultLocation ? [defaultLocation.lat, defaultLocation.lng] : null
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        setMarker([lat, lng]);
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    if (!mounted) {
        return <Skeleton className="w-full h-[300px] rounded-xl" />;
    }

    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 h-[300px] bg-[#020617] isolate">
                <MapContainer
                    center={marker || defaultCenter}
                    zoom={marker ? 15 : 2}
                    className="w-full h-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapEvents onMapClick={handleMapClick} />
                    {marker && <Marker position={marker} icon={TealIcon} />}
                </MapContainer>

                <div className="absolute bottom-4 right-4 z-[1000]">
                    <Button
                        type="button"
                        variant="secondary"
                        className="bg-slate-900/80 hover:bg-slate-900 text-teal-400 border border-slate-700 backdrop-blur-sm px-3 h-10 shadow-lg"
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                    handleMapClick(position.coords.latitude, position.coords.longitude);
                                });
                            }
                        }}
                    >
                        <Target className="h-4 w-4 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">My Location</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-teal-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Latitude</span>
                        <span className="text-sm font-mono text-slate-300">{marker ? marker[0].toFixed(6) : "---"}</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-teal-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Longitude</span>
                        <span className="text-sm font-mono text-slate-300">{marker ? marker[1].toFixed(6) : "---"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
