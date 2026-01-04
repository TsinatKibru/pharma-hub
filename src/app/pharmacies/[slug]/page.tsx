import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Pill, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PharmacyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const pharmacy = await prisma.tenant.findUnique({
        where: { slug },
        include: {
            inventories: {
                where: {
                    quantity: { gt: 0 }
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
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
            {/* Header / Cover */}
            <div className="bg-gradient-to-r from-teal-900/40 to-slate-900 border-b border-slate-800 pt-16 pb-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <Link href="/search" className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <Badge className="bg-teal-600/20 text-teal-400 border-teal-500/30 px-3 py-1">Verified Pharmacy</Badge>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{pharmacy.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-teal-500" />
                                    <span>{pharmacy.address}</span>
                                </div>
                                {pharmacy.openingHours && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-teal-500" />
                                        <span>{pharmacy.openingHours}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-6 text-lg rounded-xl">
                                Contact Pharmacy
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-teal-400">Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-300">
                                <Mail className="h-4 w-4 text-slate-500" />
                                <span>{pharmacy.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Phone className="h-4 w-4 text-slate-500" />
                                <span>+1 234 567 890</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-2">License Number</p>
                                <p className="text-slate-300 font-mono">{pharmacy.licenseNumber}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Inventory List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <Pill className="h-6 w-6 text-teal-400" />
                            Available Medicines
                        </h3>
                        <Badge variant="outline" className="text-slate-500 border-slate-800">
                            {pharmacy.inventories.length} Items
                        </Badge>
                    </div>

                    <div className="grid gap-4">
                        {pharmacy.inventories.length === 0 ? (
                            <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800 border-dashed text-slate-500">
                                This pharmacy hasn't updated its public inventory yet.
                            </div>
                        ) : (
                            pharmacy.inventories.map((item) => (
                                <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-100">{item.medicine.name}</h4>
                                                <p className="text-sm text-slate-400">{item.medicine.genericName || "Regular strength"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-teal-400">${Number(item.price).toFixed(2)}</p>
                                                <Badge variant="outline" className="mt-1 text-teal-500/80 border-teal-500/20">
                                                    {item.quantity > item.lowStockThreshold ? "In Stock" : "Limited Stock"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
