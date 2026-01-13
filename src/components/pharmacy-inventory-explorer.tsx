"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Pill, FilterX } from "lucide-react";

interface PharmacyInventoryExplorerProps {
    inventories: any[];
    initialMedicineId?: string;
}

export function PharmacyInventoryExplorer({ inventories, initialMedicineId }: PharmacyInventoryExplorerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const categories = useMemo(() => {
        const cats = new Set(inventories.map(inv => inv.medicine.category).filter(Boolean));
        return ["all", ...Array.from(cats)];
    }, [inventories]);

    const filteredInventories = useMemo(() => {
        return inventories.filter(inv => {
            const matchesSearch = inv.medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (inv.medicine.genericName && inv.medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === "all" || inv.medicine.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [inventories, searchQuery, selectedCategory]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search medicines in this pharmacy..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 py-6 bg-slate-900 border-slate-800 text-white rounded-2xl focus:ring-teal-500 shadow-inner"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <Badge
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            className={`cursor-pointer capitalize px-4 py-1.5 rounded-full transition-all ${selectedCategory === cat
                                ? "bg-teal-600 hover:bg-teal-700 text-white"
                                : "text-slate-400 border-slate-700 hover:border-teal-500/50"
                                }`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredInventories.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed text-slate-600 flex flex-col items-center gap-4">
                        <FilterX className="h-8 w-8 text-slate-800" />
                        <p className="font-medium uppercase tracking-widest text-xs">No matching medicines found in this pharmacy.</p>
                    </div>
                ) : (
                    filteredInventories.map((inv) => {
                        const isHighlighted = inv.medicine.id === initialMedicineId;
                        return (
                            <Card
                                key={inv.id}
                                id={`medicine-${inv.medicine.id}`}
                                className={`bg-[#0c1120] border-slate-900 hover:bg-slate-900/60 transition-all group shadow-xl ${isHighlighted
                                    ? "ring-2 ring-teal-500 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                                    : ""
                                    }`}
                            >
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                                            <Package className={`h-6 w-6 transition-colors ${isHighlighted ? "text-teal-400" : "text-teal-700 group-hover:text-teal-500"}`} />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold transition-colors ${isHighlighted ? "text-teal-400" : "text-slate-200"}`}>{inv.medicine.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-slate-500">{inv.medicine.category || "General Health"}</p>
                                                {inv.medicine.genericName && (
                                                    <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest leading-none">• {inv.medicine.genericName}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="text-lg font-black text-teal-400 font-mono tracking-tighter">${Number(inv.price).toFixed(2)}</div>
                                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest ${inv.quantity > 5 ? 'text-teal-600 border-teal-900/30' : 'text-amber-600 border-amber-900/30'}`}>
                                            {inv.quantity > 5 ? 'In Stock' : 'Limited Supply'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
