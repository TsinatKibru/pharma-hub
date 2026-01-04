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
import { Plus, Loader2 } from "lucide-react";
import { addInventoryItem } from "@/app/actions/inventory";
import { useToast } from "@/hooks/use-toast";

export function AddInventoryDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await addInventoryItem(formData);

        setLoading(false);
        if (result.success) {
            setOpen(false);
        } else {
            alert("Failed to add item. Please check the fields.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg hover:shadow-teal-500/20 transition-all">
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-teal-400">Add Inventory Product</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Add a new medicine or update existing stock levels.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Stock Quantity</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                placeholder="0"
                                required
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batchNumber">Batch Number</Label>
                            <Input
                                id="batchNumber"
                                name="batchNumber"
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
                                required
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Product
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
