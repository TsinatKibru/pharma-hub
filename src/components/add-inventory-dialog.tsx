"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { addInventoryItem, updateInventoryItem } from "@/app/actions/inventory";
import { toast } from "sonner";

interface InventoryItem {
    id: string;
    medicine: {
        name: string;
        genericName?: string | null;
    };
    price: number;
    quantity: number;
    lowStockThreshold: number;
    batchNumber?: string | null;
    expiryDate?: Date | string | null;
}

export function AddInventoryDialog({
    mode = "add",
    item
}: {
    mode?: "add" | "edit",
    item?: InventoryItem
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        if (mode === "edit" && item) {
            formData.append("id", item.id);
            // Medicine name and generic name are already in the medicine object, 
            // but the action expects them for validation.
            formData.append("medicineName", item.medicine.name);
            if (item.medicine.genericName) formData.append("genericName", item.medicine.genericName);
        }

        const result = mode === "add"
            ? await addInventoryItem(formData)
            : await updateInventoryItem(formData);

        setLoading(false);
        if (result.success) {
            toast.success(mode === "add" ? "Product added successfully" : "Product updated successfully");
            setOpen(false);
        } else {
            toast.error("Process failed. Please verify all fields.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === "add" ? (
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg hover:shadow-teal-500/20 transition-all font-bold">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-teal-400">
                        {mode === "add" ? "Add Inventory Product" : "Edit Inventory Product"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {mode === "add"
                            ? "Add a new medicine or update existing stock levels."
                            : `Updating details for ${item?.medicine.name}`}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        {mode === "add" && (
                            <>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="medicineName">Product Name</Label>
                                    <Input
                                        id="medicineName"
                                        name="medicineName"
                                        placeholder="e.g. Panadol 500mg"
                                        required
                                        className="bg-slate-800 border-slate-700 focus:ring-teal-500"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="genericName">Generic Name / Active Ingredient</Label>
                                    <Input
                                        id="genericName"
                                        name="genericName"
                                        placeholder="e.g. Paracetamol"
                                        className="bg-slate-800 border-slate-700"
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2 text-slate-500 text-xs col-span-2 uppercase font-bold tracking-widest pt-2 border-t border-slate-800/50">
                            Fulfillment Details
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={item?.price}
                                placeholder="0.00"
                                required
                                className="bg-slate-800 border-slate-700 font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Stock Quantity</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                defaultValue={item?.quantity}
                                placeholder="0"
                                required
                                className="bg-slate-800 border-slate-700 font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batchNumber">Batch Number</Label>
                            <Input
                                id="batchNumber"
                                name="batchNumber"
                                defaultValue={item?.batchNumber || ""}
                                placeholder="BN-123"
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                name="expiryDate"
                                type="date"
                                defaultValue={item?.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ""}
                                required
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-widest"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "add" ? "Save Product" : "Confirm Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
