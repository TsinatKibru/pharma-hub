"use client";

import dynamic from "next/dynamic";
import React from "react";

/**
 * Centrailized map loaders to handle Leaflet's browser-only requirements safely.
 * This prevents "window is not defined" errors during Server-side rendering.
 */

export const MapDisplay = dynamic(
    () => import("./map-display").then((mod) => mod.MapDisplay),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full min-h-[400px] rounded-2xl bg-[#020617] animate-pulse border border-slate-900 flex items-center justify-center">
                <span className="text-slate-700 font-bold uppercase tracking-widest text-[10px]">Initializing Map Grid...</span>
            </div>
        ),
    }
);

export const LocationPicker = dynamic(
    () => import("./location-picker").then((mod) => mod.LocationPicker),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[300px] rounded-xl bg-slate-900/50 animate-pulse border border-slate-800 flex items-center justify-center">
                <span className="text-slate-700 font-bold uppercase tracking-widest text-[10px]">Loading Picker Latency...</span>
            </div>
        ),
    }
);
