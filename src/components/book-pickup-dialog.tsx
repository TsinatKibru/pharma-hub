"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createBooking } from "@/app/actions/bookings";
import { toast } from "sonner";

interface BookPickupDialogProps {
    inventoryId: string;
    pharmacyName: string;
    medicineName: string;
    price: number;
    availableQuantity: number;
    tenantId: string;
}

export function BookPickupDialog({
    inventoryId,
    pharmacyName,
    medicineName,
    price,
    availableQuantity,
    tenantId
}: BookPickupDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState<any>(null);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const result: any = await createBooking({
                inventoryId,
                quantity,
                tenantId
            });

            if (result.error) {
                toast.error("Reservation failed", {
                    description: result.error,
                });
                return;
            }

            setBookingSuccess(result);
            toast.success("Reservation successful!", {
                description: `Your pickup code is ${result.pickupCode}`,
            });
        } catch (error: any) {
            toast.error("An unexpected error occurred", {
                description: "Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (bookingSuccess) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-slate-950 border-slate-900 sm:max-w-[425px]">
                    <div className="flex flex-col items-center text-center space-y-6 py-6">
                        <div className="h-20 w-20 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <CheckCircle2 className="h-10 w-10 text-teal-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Booking Confirmed!</h3>
                            <p className="text-slate-400 text-sm">Please show this code at the pharmacy counter.</p>
                        </div>
                        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Your Pickup Code</p>
                            <p className="text-5xl font-black text-teal-400 font-mono tracking-widest">{bookingSuccess.pickupCode}</p>
                        </div>
                        <Button
                            onClick={() => {
                                setOpen(false);
                                setBookingSuccess(null);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white w-full rounded-xl"
                        >
                            Got it
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/10 uppercase tracking-widest text-[10px] py-6">
                    Book Pick-up
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-teal-500" /> Reserve for Pick-up
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Reserve your medicine at <span className="text-teal-500 font-bold">{pharmacyName}</span>.
                        No payment required online. Pay when you pick up.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-6">
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Item</p>
                            <p className="text-lg font-bold text-white tracking-tight">{medicineName}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price per unit</p>
                            <p className="text-lg font-mono font-black text-teal-400 tracking-tighter">${price.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity to Reserve</Label>
                            <span className="text-[10px] font-bold text-slate-400">{availableQuantity} available</span>
                        </div>
                        <Input
                            type="number"
                            min={1}
                            max={availableQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="bg-slate-900 border-slate-800 text-white h-12 text-lg font-mono focus:ring-teal-500 rounded-xl"
                        />
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                            Your reservation will be held for <span className="font-bold">24 hours</span>. Please pick it up before it expires.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading || quantity < 1 || quantity > availableQuantity}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-6 rounded-xl uppercase tracking-widest"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Processing..." : "Confirm Reservation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
