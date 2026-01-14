"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getUserBookings } from "@/app/actions/bookings";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Package, Clock, Hash } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface PatientBookingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PatientBookingsDialog({ open, onOpenChange }: PatientBookingsDialogProps) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getUserBookings()
                .then(data => setBookings(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [open]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "READY": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse";
            case "COMPLETED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "CANCELLED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[#0c1120] border-slate-800 text-slate-100 max-h-[85vh] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2 border-b border-slate-800/50">
                    <DialogTitle className="text-xl font-bold text-teal-400 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My Bookings
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        Your medicine reservations & status
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto p-6 pt-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-24 bg-slate-900/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500 text-sm">No bookings found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-teal-500/30 transition-colors"
                                >
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </Badge>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Pickup Code</span>
                                            <span className="font-mono text-xl font-black text-teal-400 tracking-wider bg-teal-950/30 px-2 rounded-md border border-teal-500/20">
                                                {booking.pickupCode}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        {/* Medicine & Quantity */}
                                        <div>
                                            <h4 className="font-bold text-white text-lg leading-tight">
                                                {booking.inventory.medicine.name}
                                                <span className="text-slate-500 text-sm font-normal ml-2">x{booking.quantity}</span>
                                            </h4>
                                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">
                                                {booking.inventory.medicine.genericName}
                                            </p>
                                        </div>

                                        {/* Pharmacy Info */}
                                        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/50 p-2 rounded-lg">
                                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-teal-600 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-300">{booking.inventory.tenant.name}</p>
                                                <p className="line-clamp-1 opacity-70">{booking.inventory.tenant.address}</p>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium uppercase tracking-widest pt-1">
                                            <Calendar className="h-3 w-3" />
                                            Booked {format(new Date(booking.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </div>

                                    {/* Decorative gradient */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800/50 bg-[#0c1120]">
                    <Button onClick={() => onOpenChange(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
