import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Smartphone, Package, ChevronRight, Home, Activity, ShoppingBag, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapDisplay } from "@/components/map-loader";
import { PharmacyInventoryExplorer } from "@/components/pharmacy-inventory-explorer";
import { ScrollToHighlight } from "@/components/scroll-to-highlight";
import { Suspense } from "react";

interface InventoryItem {
    id: string;
    price: any;
    quantity: number;
    medicine: {
        id: string;
        name: string;
        genericName: string | null;
        category: string | null;
    };
}

export default async function PharmacyDetailPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const { medicineId } = await searchParams;

    const pharmacy = await prisma.tenant.findUnique({
        where: { slug },
        include: {
            inventories: {
                include: {
                    medicine: true
                }
            }
        }
    });

    if (!pharmacy || pharmacy.status !== "ACTIVE") {
        notFound();
    }

    // Filter and serialize inventories to ensure plain objects for Client Components
    const availableInventories: InventoryItem[] = (pharmacy.inventories as any[])
        .filter(inv => inv.quantity > 0)
        .map(inv => ({
            ...inv,
            price: Number(inv.price)
        }));

    // Calculate Statistics
    const prices = availableInventories.map(inv => Number(inv.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const lowStockCount = availableInventories.filter(inv => inv.quantity <= 5).length;
    const healthyStockCount = availableInventories.length - lowStockCount;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Suspense>
                <ScrollToHighlight />
            </Suspense>

            {/* Breadcrumbs */}
            <nav className="max-w-6xl mx-auto px-4 pt-8">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <Link href="/" className="hover:text-teal-500 transition-colors flex items-center gap-1.5">
                        <Home className="h-3 w-3" /> Home
                    </Link>
                    <ChevronRight className="h-3 w-3 text-slate-800" />
                    <Link href="/search" className="hover:text-teal-500 transition-colors">
                        Search
                    </Link>
                    <ChevronRight className="h-3 w-3 text-slate-800" />
                    <span className="text-slate-300">Pharmacy Details</span>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-teal-900/10 to-transparent py-16 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px] font-black uppercase px-3 py-1">
                                Verified Partner
                            </Badge>
                            <Badge className="bg-slate-900/50 text-slate-400 border-slate-800 text-[10px] font-black uppercase px-3 py-1">
                                ID: {pharmacy.id.slice(-8).toUpperCase()}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                                {pharmacy.name}
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl max-w-xl flex items-center gap-2 font-medium">
                                <MapPin className="h-5 w-5 text-teal-600 shrink-0" />
                                {pharmacy.address}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 pb-24">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column: Explorer */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-teal-500 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" /> Live Inventory
                                </h2>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Real-time stock from this location</p>
                            </div>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{availableInventories.length} Items</span>
                        </div>

                        <PharmacyInventoryExplorer
                            inventories={availableInventories}
                            initialMedicineId={Array.isArray(medicineId) ? medicineId[0] : medicineId}
                            pharmacyName={pharmacy.name}
                            tenantId={pharmacy.id}
                        />
                    </div>

                    {/* Right Column: Information & Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Snapshot Widget */}
                        <Card className="bg-[#0c1120] border-slate-900 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-slate-900/30 border-b border-slate-800/50">
                                <CardTitle className="text-xs font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Pharmacy Snapshot
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Pricing Floor</p>
                                        <p className="text-xl font-black text-slate-100 font-mono tracking-tighter">${minPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Pricing Ceiling</p>
                                        <p className="text-xl font-black text-slate-100 font-mono tracking-tighter">${maxPrice.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-teal-500">Inventory Health</span>
                                            <span className="text-slate-500">{healthyStockCount} Stable</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all"
                                                style={{ width: availableInventories.length > 0 ? `${(healthyStockCount / availableInventories.length) * 100}%` : "0%" }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-amber-500">Low Stock Alert</span>
                                            <span className="text-slate-500">{lowStockCount} Running Low</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all"
                                                style={{ width: availableInventories.length > 0 ? `${(lowStockCount / availableInventories.length) * 100}%` : "0%" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact & Hours */}
                        <Card className="bg-[#0c1120] border-slate-900 shadow-2xl sticky top-8">
                            <CardHeader className="bg-slate-900/30 border-b border-slate-800/50">
                                <CardTitle className="text-xs font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Connect & Hours
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-7 rounded-2xl uppercase tracking-widest shadow-lg shadow-teal-500/20 group">
                                    <Smartphone className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform text-white" />
                                    Contact Now
                                </Button>

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-900">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                                                <Clock className="h-5 w-5 text-teal-700" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">Operating Schedule</div>
                                                <div className="text-sm text-slate-300 font-bold uppercase tracking-tight">Active Hours</div>
                                            </div>
                                        </div>

                                        {typeof pharmacy.openingHours === 'object' && pharmacy.openingHours !== null && (
                                            <div className="grid gap-2.5 pt-4 border-t border-slate-900/50">
                                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                                    const schedule = (pharmacy.openingHours as any)[day];
                                                    if (!schedule) return null;
                                                    return (
                                                        <div key={day} className="flex justify-between items-center text-[10px]">
                                                            <span className="text-slate-500 uppercase font-black tracking-widest w-20">{day.slice(0, 3)}</span>
                                                            <div className="h-px flex-1 bg-slate-900/50 mx-3" />
                                                            <span className={`font-mono font-bold ${schedule.closed ? 'text-rose-500/60' : 'text-slate-400'}`}>
                                                                {schedule.closed ? 'CLOSED' : `${schedule.open} - ${schedule.close}`}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Map Visualization */}
                                    {pharmacy.lat && pharmacy.lng && (
                                        <div className="space-y-4 pt-4 border-t border-slate-900">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Live Location</span>
                                                <Badge className="bg-teal-500/10 text-teal-500 border-none text-[8px] font-black uppercase tracking-widest">Verified Coord</Badge>
                                            </div>
                                            <div className="h-48 w-full relative rounded-2xl overflow-hidden border border-slate-900 shadow-inner">
                                                <MapDisplay
                                                    center={{ lat: pharmacy.lat, lng: pharmacy.lng }}
                                                    markers={[{ id: pharmacy.id, lat: pharmacy.lat, lng: pharmacy.lng, pharmacyName: pharmacy.name }]}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
