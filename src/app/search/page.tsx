"use client";

import { useState, useEffect as useReactEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Pill, ArrowRight, Info, LayoutGrid, Map as MapIcon, Navigation, ArrowUpDown } from "lucide-react";
import { searchMedicines } from "@/app/actions/search";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapDisplay } from "@/components/map-loader";
import { calculateDistance, formatDistance } from "@/lib/geo-utils";

export default function PublicSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"list" | "map">("list");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [sortBy, setSortBy] = useState<"distance" | "price">("distance");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const categories = [
        "all", "antibiotics", "pain relief", "cardiac", "vitamins", "respiratory", "dermatology"
    ];

    useReactEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.error("Geolocation error:", error)
            );
        }
    }, []);

    async function handleSearch(e?: React.FormEvent, categoryOverride?: string) {
        if (e) e.preventDefault();
        const categoryToSearch = categoryOverride || selectedCategory;

        // Allow searching by category even if query is empty
        if (!query && categoryToSearch === "all") {
            // For browsing-only mode, we can fetch all or featured
            setLoading(true);
            const data = await searchMedicines("", "all");
            setResults(data);
            setLoading(false);
            return;
        }

        setLoading(true);
        const data = await searchMedicines(query, categoryToSearch);
        setResults(data);
        setCurrentPage(1);
        setLoading(false);
    }

    const checkIsOpen = (openingHours: any) => {
        if (!openingHours || typeof openingHours !== 'object') return null;

        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];
        const schedule = openingHours[currentDay];

        if (!schedule || schedule.closed) return false;
        if (!schedule.open || !schedule.close) return true; // Assume open if specified but no times

        const [nowH, nowM] = [now.getHours(), now.getMinutes()];
        const [openH, openM] = schedule.open.split(':').map(Number);
        const [closeH, closeM] = schedule.close.split(':').map(Number);

        const nowTotal = nowH * 60 + nowM;
        const openTotal = openH * 60 + openM;
        const closeTotal = closeH * 60 + closeM;

        return nowTotal >= openTotal && nowTotal <= closeTotal;
    };

    // Process results with distance and low price detection
    const processedResults = results.map(med => {
        // Find the lowest price first among ALL pharmacies for this medicine
        const minPrice = Math.min(...med.pharmacies.map((p: any) => p.price));

        const pharmaciesWithDistance = med.pharmacies.map((p: any) => {
            let distance = null;
            if (userLocation && p.location?.lat && p.location?.lng) {
                distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    p.location.lat,
                    p.location.lng
                );
            }
            return {
                ...p,
                distance,
                isLowestPrice: p.price === minPrice
            };
        });

        // Sort pharmacies within medicine based on user preference
        pharmaciesWithDistance.sort((a: any, b: any) => {
            if (sortBy === "distance") {
                if (a.distance !== null && b.distance !== null) {
                    return a.distance - b.distance;
                }
                // Fallback to price if distance unavailable
                return a.price - b.price;
            } else {
                // Strictly by price
                return a.price - b.price;
            }
        });

        return { ...med, pharmacies: pharmaciesWithDistance };
    }).sort((a, b) => {
        if (sortBy === "price") {
            const aMin = Math.min(...a.pharmacies.map((p: any) => p.price));
            const bMin = Math.min(...b.pharmacies.map((p: any) => p.price));
            return aMin - bMin;
        }
        return 0;
    });

    const totalPages = Math.ceil(processedResults.length / itemsPerPage);
    const paginatedResults = processedResults.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Collect all pharmacy markers for the map view
    const allMarkers = processedResults.flatMap((med: any) =>
        med.pharmacies
            .filter((p: any) => p.location?.lat && p.location?.lng)
            .map((p: any) => ({
                id: p.id,
                lat: p.location.lat,
                lng: p.location.lng,
                title: `${p.name} - ${med.name} (${p.distance ? formatDistance(p.distance) : '??'})`
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

                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map((cat) => (
                                <Badge
                                    key={cat}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    className={`cursor-pointer capitalize px-4 py-1.5 rounded-full transition-all ${selectedCategory === cat
                                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20"
                                        : "text-slate-400 border-slate-700 hover:border-teal-500/50"
                                        }`}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        handleSearch(undefined, cat);
                                    }}
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>

                        {processedResults.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-4">
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

                                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSortBy("distance")}
                                        className={`rounded-lg px-4 ${sortBy === "distance" ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        Distance
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSortBy("price")}
                                        className={`rounded-lg px-4 ${sortBy === "price" ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        Price
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="max-w-6xl mx-auto mt-12 px-4">
                {processedResults.length > 0 ? (
                    view === "list" ? (
                        <div className="max-w-4xl mx-auto space-y-12">
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 py-6 bg-slate-900/10 rounded-3xl border border-slate-800/50 mb-8">
                                    <Button
                                        variant="outline"
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            setCurrentPage(p => Math.max(1, p - 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="bg-slate-950/50 border-slate-800 text-slate-400 hover:text-teal-400 rounded-2xl px-6 py-4 font-bold uppercase tracking-widest text-[9px]"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Grid Page</span>
                                        <span className="text-xs font-black text-slate-400">
                                            {currentPage} <span className="text-slate-800 mx-1">/</span> {totalPages}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        disabled={currentPage === totalPages}
                                        onClick={() => {
                                            setCurrentPage(p => Math.min(totalPages, p + 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="bg-slate-950/50 border-slate-800 text-slate-400 hover:text-teal-400 rounded-2xl px-6 py-4 font-bold uppercase tracking-widest text-[9px]"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                            {paginatedResults.map((medicine: any) => (
                                <div key={medicine.id} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                            <Pill className="h-5 w-5 md:h-6 md:w-6 text-teal-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-white">{medicine.name}</h2>
                                            <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-[0.2em]">{medicine.genericName}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {medicine.pharmacies.map((pharmacy: any) => (
                                            <Card key={`${medicine.id}-${pharmacy.id}`} className="bg-[#0c1120] border-slate-900 hover:border-teal-900/50 transition-all group hover:shadow-2xl hover:shadow-teal-900/10">
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-lg font-bold text-slate-200 group-hover:text-teal-400 transition-colors uppercase tracking-tight">{pharmacy.name}</CardTitle>
                                                        <div className="flex flex-col items-end gap-1">
                                                            {pharmacy.distance && (
                                                                <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border-none text-[10px] font-bold">
                                                                    {formatDistance(pharmacy.distance)}
                                                                </Badge>
                                                            )}
                                                            {pharmacy.isLowestPrice && (
                                                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black uppercase tracking-widest">
                                                                    Lowest Price
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                                                            <MapPin className="h-3 w-3 text-teal-600" />
                                                            <span className="truncate">{pharmacy.address}</span>
                                                        </div>
                                                        {checkIsOpen(pharmacy.openingHours) !== null && (
                                                            <Badge
                                                                className={`text-[8px] font-black uppercase rounded-full px-2 border-none ${checkIsOpen(pharmacy.openingHours)
                                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                                    : "bg-rose-500/10 text-rose-500"
                                                                    }`}
                                                            >
                                                                {checkIsOpen(pharmacy.openingHours) ? "Open Now" : "Closed"}
                                                            </Badge>
                                                        )}
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
                                                    <div className="flex gap-2 mt-6">
                                                        <Button asChild className="flex-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-teal-400 border border-slate-800 rounded-xl py-6 font-bold uppercase tracking-widest text-[10px]">
                                                            <Link href={`/pharmacies/${pharmacy.slug}`}>
                                                                Visit <ArrowRight className="h-3 w-3 ml-2" />
                                                            </Link>
                                                        </Button>
                                                        {pharmacy.location?.lat && pharmacy.location?.lng && (
                                                            <Button asChild variant="outline" className="flex-1 bg-teal-600/5 hover:bg-teal-600/10 text-teal-500 border-teal-500/20 rounded-xl py-6 font-bold uppercase tracking-widest text-[10px]">
                                                                <a
                                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Directions <Navigation className="h-3 w-3 ml-2" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        </div>
                    ) : (
                        <div className="h-[600px] w-full rounded-2xl border border-slate-900 overflow-hidden shadow-2xl relative">
                            <MapDisplay
                                center={allMarkers.length > 0 ? { lat: allMarkers[0].lat, lng: allMarkers[0].lng } : { lat: 30.0444, lng: 31.2357 }} // Cairo default or first result
                                zoom={allMarkers.length > 0 ? 12 : 10}
                                markers={allMarkers}
                                className="h-full border-none rounded-none"
                            />
                            {userLocation && (
                                <div className="absolute top-4 left-4 z-[1000] p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">GPS Synchronized</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                ) : query && !loading ? (
                    <div className="text-center py-20 bg-[#0c1120] rounded-3xl border border-slate-900 border-dashed">
                        <Info className="h-10 w-10 text-slate-800 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Medicine Not Found</h3>
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
