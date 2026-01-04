"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Pill, ArrowRight, Info, LayoutGrid, Map as MapIcon } from "lucide-react";
import { searchMedicines } from "@/app/actions/search";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapDisplay } from "@/components/map-loader";

export default function PublicSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"list" | "map">("list");

    async function handleSearch(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (query.length < 2) return;

        setLoading(true);
        const data = await searchMedicines(query);
        setResults(data);
        setLoading(false);
    }

    // Collect all pharmacy markers for the map view
    const allMarkers = results.flatMap((med: any) =>
        med.pharmacies
            .filter((p: any) => p.location?.lat && p.location?.lng)
            .map((p: any) => ({
                id: p.id,
                lat: p.location.lat,
                lng: p.location.lng,
                title: `${p.name} - ${med.name}`
            }))
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-16 px-4 border-b border-slate-800">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
                        Find <span className="text-teal-400">Medicine</span> Near You
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Search across local pharmacies to compare prices and check availability in real-time.
                    </p>

                    <div className="flex flex-col items-center gap-6 mt-8">
                        <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <Input
                                placeholder="Search by brand or generic name (e.g. Panadol, Paracetamol)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-12 py-7 text-lg bg-slate-800 border-slate-700 text-white rounded-2xl focus:ring-teal-500 shadow-2xl"
                            />
                            <Button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6"
                                disabled={loading}
                            >
                                {loading ? "Searching..." : "Search"}
                            </Button>
                        </form>

                        {results.length > 0 && (
                            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView("list")}
                                    className={`rounded-lg px-4 ${view === "list" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    List
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView("map")}
                                    className={`rounded-lg px-4 ${view === "map" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    <MapIcon className="h-4 w-4 mr-2" />
                                    Map View
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="max-w-6xl mx-auto mt-12 px-4">
                {results.length > 0 ? (
                    view === "list" ? (
                        <div className="grid gap-12">
                            {results.map((medicine: any) => (
                                <div key={medicine.id} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                            <Pill className="h-5 w-5 text-teal-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">{medicine.name}</h2>
                                            {medicine.genericName && (
                                                <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                                                    Generic: {medicine.genericName}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {medicine.pharmacies.map((pharmacy: any, idx: number) => (
                                            <Card key={idx} className={`bg-[#0c1120] border-slate-900 hover:border-teal-500/50 transition-all shadow-xl group ${idx === 0 ? 'ring-1 ring-teal-500/30' : ''}`}>
                                                <CardHeader className="pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base font-bold text-slate-100 tracking-tight group-hover:text-teal-400 transition-colors uppercase">{pharmacy.name}</CardTitle>
                                                        {idx === 0 && (
                                                            <Badge className="bg-teal-500/10 text-teal-500 border-none text-[8px] font-black uppercase tracking-widest">
                                                                Lowest Price
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-tighter mt-1">
                                                        <MapPin className="h-3 w-3 text-teal-600" />
                                                        <span className="truncate">{pharmacy.address}</span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Stock</p>
                                                            <Badge variant="outline" className={`text-[8px] font-black uppercase border-none px-0 ${pharmacy.availability === "In Stock" ? "text-teal-500" : "text-amber-500"}`}>
                                                                {pharmacy.availability}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Price Point</p>
                                                            <p className="text-2xl font-black text-slate-100 tracking-tighter font-mono">${pharmacy.price.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <Button asChild className="w-full mt-6 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-teal-400 border border-slate-800 rounded-xl py-6 font-bold uppercase tracking-widest text-[10px]">
                                                        <Link href={`/pharmacies/${pharmacy.slug}`}>
                                                            Visit Pharmacy <ArrowRight className="h-3 w-3 ml-2" />
                                                        </Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[600px] w-full rounded-2xl border border-slate-900 overflow-hidden shadow-2xl">
                            <MapDisplay
                                center={allMarkers.length > 0 ? { lat: allMarkers[0].lat, lng: allMarkers[0].lng } : { lat: 30.0444, lng: 31.2357 }} // Cairo default or first result
                                zoom={allMarkers.length > 0 ? 12 : 10}
                                markers={allMarkers}
                                className="h-full border-none rounded-none"
                            />
                        </div>
                    )
                ) : query && !loading ? (
                    <div className="text-center py-20 bg-[#0c1120] rounded-3xl border border-slate-900 border-dashed">
                        <Info className="h-10 w-10 text-slate-800 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Nomenclature Not Found</h3>
                        <p className="text-slate-600 max-w-sm mx-auto mt-2 text-sm font-medium">
                            No matching medicines detected in the regional grid. Try generic names or verified brands.
                        </p>
                    </div>
                ) : !loading && (
                    <div className="text-center py-32">
                        <Pill className="h-16 w-16 text-slate-900 mx-auto mb-6 opacity-40 animate-pulse" />
                        <p className="text-slate-700 font-bold uppercase tracking-[0.3em] text-[10px]">Awaiting Search Parameter</p>
                    </div>
                )}
            </section>
        </div>
    );
}
