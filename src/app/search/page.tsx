"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Pill, ArrowRight, Info } from "lucide-react";
import { searchMedicines } from "@/app/actions/search";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function PublicSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function handleSearch(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (query.length < 2) return;

        setLoading(true);
        const data = await searchMedicines(query);
        setResults(data);
        setLoading(false);
    }

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

                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-8">
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
                </div>
            </section>

            {/* Results Section */}
            <section className="max-w-6xl mx-auto mt-12 px-4">
                {results.length > 0 ? (
                    <div className="grid gap-8">
                        {results.map((medicine) => (
                            <div key={medicine.id} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Pill className="h-6 w-6 text-teal-400" />
                                    <h2 className="text-2xl font-bold">{medicine.name}</h2>
                                    {medicine.genericName && (
                                        <Badge variant="outline" className="text-slate-400 border-slate-700 capitalize">
                                            {medicine.genericName}
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {medicine.pharmacies.map((pharmacy: any, idx: number) => (
                                        <Card key={idx} className={`bg-slate-900 border-slate-800 hover:border-teal-500/50 transition-all ${idx === 0 ? 'ring-2 ring-teal-500/20' : ''}`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-lg text-slate-100">{pharmacy.name}</CardTitle>
                                                    {idx === 0 && (
                                                        <Badge className="bg-teal-600/20 text-teal-400 border-teal-500/30">
                                                            Best Price
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{pharmacy.address}</span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-end mt-2">
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Availability</p>
                                                        <p className={`text-sm font-medium ${pharmacy.availability === "In Stock" ? "text-teal-400" : "text-amber-400"}`}>
                                                            {pharmacy.availability}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Price</p>
                                                        <p className="text-2xl font-black text-white">${pharmacy.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <Button asChild className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                                                    <Link href={`/pharmacies/${pharmacy.slug}`}>
                                                        View Details <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query && !loading ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                        <Info className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-400">No matching medicines found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            Try searching for a broad name like "Paracetamol" or "Panadol".
                        </p>
                    </div>
                ) : !loading && (
                    <div className="text-center py-20">
                        <Pill className="h-16 w-16 text-slate-800 mx-auto mb-6 opacity-20" />
                        <p className="text-slate-500">Your search results will appear here.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
