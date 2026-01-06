import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Pill, ArrowLeft, Smartphone, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapDisplay } from "@/components/map-loader";

export default async function PharmacyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const pharmacy = await prisma.tenant.findUnique({
        where: { slug },
        include: {
            inventories: {
                where: {
                    quantity: {
                        gt: 0
                    }
                },
                include: {
                    medicine: true
                }
            }
        }
    });

    if (!pharmacy || pharmacy.status !== "ACTIVE") {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-teal-900/20 to-slate-950 py-20 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-teal-500 text-sm font-bold uppercase tracking-widest">
                            <span className="px-2 py-1 bg-teal-500/10 rounded border border-teal-500/20">Verified Partner</span>
                            {pharmacy.openingHours && (
                                <span>•
                                    {typeof pharmacy.openingHours === 'object'
                                        ? " Schedule Available"
                                        : ` Opened: ${pharmacy.openingHours}`}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight">{pharmacy.name}</h1>
                        <p className="text-slate-400 text-lg max-w-xl flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-teal-600" />
                            {pharmacy.address}
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Inventory List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                            <h2 className="text-xl font-bold uppercase tracking-widest text-teal-500">Live Inventory</h2>
                            <span className="text-slate-500 text-sm">{pharmacy.inventories.length} Products Available</span>
                        </div>

                        <div className="grid gap-4">
                            {pharmacy.inventories.length === 0 ? (
                                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-900 border-dashed text-slate-600">
                                    No public inventory items listed.
                                </div>
                            ) : (
                                pharmacy.inventories.map((inv) => (
                                    <Card key={inv.id} className="bg-[#0c1120] border-slate-900 hover:bg-slate-900/60 transition-all group shadow-xl">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                                                    <Package className="h-6 w-6 text-teal-700 group-hover:text-teal-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-200">{inv.medicine.name}</h3>
                                                    <p className="text-xs text-slate-500">{inv.medicine.category || "General Health"}</p>
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
                                ))
                            )}
                        </div>
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-8">
                        <Card className="bg-[#0c1120] border-slate-900 shadow-2xl sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-xs font-black text-teal-500 uppercase tracking-widest">Connect & Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-7 uppercase tracking-widest shadow-lg shadow-teal-500/20">
                                    <Smartphone className="h-5 w-5 mr-3" />
                                    Contact Pharmacy
                                </Button>
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-950 border border-slate-900">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                                                <Clock className="h-5 w-5 text-teal-700" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Operating Hours</div>
                                                <div className="text-sm text-slate-300 font-bold">
                                                    {typeof pharmacy.openingHours === 'object' && pharmacy.openingHours !== null
                                                        ? "Weekly Schedule"
                                                        : (pharmacy.openingHours || "8:00 AM - 10:00 PM")}
                                                </div>
                                            </div>
                                        </div>

                                        {typeof pharmacy.openingHours === 'object' && pharmacy.openingHours !== null && (
                                            <div className="grid gap-2 pt-2 border-t border-slate-900/50 mt-1">
                                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                                    const schedule = (pharmacy.openingHours as any)[day];
                                                    if (!schedule) return null;
                                                    return (
                                                        <div key={day} className="flex justify-between items-center text-[10px]">
                                                            <span className="text-slate-500 uppercase font-bold tracking-tight w-20">{day}</span>
                                                            <div className="h-px flex-1 bg-slate-900/50 mx-2" />
                                                            <span className={`font-mono font-bold ${schedule.closed ? 'text-rose-500/80' : 'text-slate-400'}`}>
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
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Live Location</span>
                                                <Badge className="bg-teal-500/10 text-teal-500 border-none text-[8px] font-black uppercase tracking-widest">Satellite Verified</Badge>
                                            </div>
                                            <div className="h-64 w-full relative">
                                                <MapDisplay
                                                    center={{ lat: pharmacy.lat, lng: pharmacy.lng }}
                                                    markers={[{ id: pharmacy.id, lat: pharmacy.lat, lng: pharmacy.lng, title: pharmacy.name }]}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-5 bg-teal-500/5 rounded-2xl border border-teal-500/10 ring-1 ring-teal-500/5">
                                        <p className="text-[11px] text-teal-700/80 font-bold leading-relaxed italic">
                                            &ldquo;Find the right medicine at the right price, verified by PharmaHub network transparency.&rdquo;
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
