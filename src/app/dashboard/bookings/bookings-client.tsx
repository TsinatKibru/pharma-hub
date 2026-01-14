"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Clock,
    XCircle,
    Package,
    User,
    CalendarDays
} from "lucide-react";
import { updateBookingStatus } from "@/app/actions/bookings";
import { toast } from "sonner";
import { BookingStatus } from "@prisma/client";

export function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
    const [bookings, setBookings] = useState(initialBookings);
    const [filter, setFilter] = useState<string>("all");

    const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
        try {
            await updateBookingStatus(bookingId, status);
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
            toast.success(`Booking marked as ${status.toLowerCase()}`);
        } catch (error: any) {
            toast.error("Failed to update booking status");
        }
    };

    const filteredBookings = bookings.filter(b => filter === "all" || b.status === filter);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock };
            case "READY":
                return { color: "text-teal-500 bg-teal-500/10 border-teal-500/20", icon: Package };
            case "COMPLETED":
                return { color: "text-slate-500 bg-slate-500/10 border-slate-500/20", icon: CheckCircle2 };
            case "CANCELLED":
                return { color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: XCircle };
            default:
                return { color: "text-slate-500 bg-slate-500/10 border-slate-500/20", icon: Clock };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {["all", "PENDING", "READY", "COMPLETED", "CANCELLED"].map(s => (
                    <Button
                        key={s}
                        variant={filter === s ? "default" : "outline"}
                        onClick={() => setFilter(s)}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 h-9 rounded-xl transition-all ${filter === s ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200"
                            }`}
                    >
                        {s}
                    </Button>
                ))}
            </div>

            <div className="grid gap-4">
                {filteredBookings.length === 0 ? (
                    <Card className="bg-[#0c1120] border-slate-900 border-dashed border-2 py-20">
                        <CardContent className="flex flex-col items-center justify-center text-slate-600 gap-4">
                            <CalendarDays className="h-12 w-12 text-slate-800" />
                            <p className="font-black uppercase tracking-widest text-xs">No bookings found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredBookings.map(booking => {
                        const config = getStatusConfig(booking.status);
                        return (
                            <Card key={booking.id} className="bg-[#0c1120] border-slate-900 overflow-hidden shadow-xl hover:bg-slate-900/40 transition-all">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-stretch">
                                        {/* Status Sidebar */}
                                        <div className={`w-1 md:w-2 ${config.color.split(' ')[0].replace('text-', 'bg-')}`} />

                                        <div className="flex-1 p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                                            <div className="flex flex-col md:flex-row gap-6 lg:items-center">
                                                <div className="space-y-4 min-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`${config.color} border font-black uppercase tracking-widest text-[10px]`}>
                                                            <config.icon className="h-3 w-3 mr-1.5" />
                                                            {booking.status}
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-700 font-mono font-bold uppercase tracking-widest">#{booking.id.slice(-8).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-white tracking-tight">{booking.inventory.medicine.name}</h3>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Quantity Requested: <span className="text-slate-300">{booking.quantity} Units</span></p>
                                                    </div>
                                                </div>

                                                <div className="hidden md:block h-12 w-px bg-slate-900" />

                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                            <User className="h-3 w-3" /> Patient Email
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-300">{booking.user.email}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pickup Code</p>
                                                        <p className="text-xl font-black text-teal-400 font-mono tracking-widest">{booking.pickupCode}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {booking.status === "PENDING" && (
                                                    <Button
                                                        onClick={() => handleStatusUpdate(booking.id, "READY")}
                                                        className="bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-widest text-[10px] px-6 py-5 rounded-xl h-auto flex-1 md:flex-none"
                                                    >
                                                        Mark as Ready
                                                    </Button>
                                                )}
                                                {booking.status === "READY" && (
                                                    <Button
                                                        onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] px-6 py-5 rounded-xl h-auto flex-1 md:flex-none"
                                                    >
                                                        Complete Pick-up
                                                    </Button>
                                                )}
                                                {(booking.status === "PENDING" || booking.status === "READY") && (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                                        className="text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 font-bold uppercase tracking-widest text-[10px] px-4 rounded-xl h-auto py-5"
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
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
