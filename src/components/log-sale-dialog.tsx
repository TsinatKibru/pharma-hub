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
import { ShoppingCart, Loader2 } from "lucide-react";
import { logSale } from "@/app/actions/sales";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export function LogSaleDialog({ inventory }: { inventory: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState("");

    const selectedItem = inventory.find(i => i.id === selectedInventoryId);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedInventoryId) return;

        setLoading(true);
        const formData = new FormData(event.currentTarget);
        formData.append("inventoryId", selectedInventoryId);

        // Automatically use the current inventory price as the unitPrice
        if (selectedItem) {
            formData.append("unitPrice", selectedItem.price.toString());
        }

        const result = await logSale(formData);

        setLoading(false);
        if (result.success) {
            setOpen(false);
            setSelectedInventoryId("");
        } else {
            alert(result.error?.general || "Failed to log sale. Check stock levels.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-lg">
                    <ShoppingCart className="h-4 w-4" />
                    Log Sale
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-teal-400">Record a Sale</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Deduct items from inventory and record price totals.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Select Product</Label>
                        <Select onValueChange={setSelectedInventoryId} value={selectedInventoryId}>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                                <SelectValue placeholder="Select a medicine..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                {inventory.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.medicine.name} (Stock: {item.quantity})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedItem && (
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Unit Price:</span>
                                <span className="text-teal-400 font-bold">${Number(selectedItem.price).toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity Sold</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            defaultValue="1"
                            required
                            className="bg-slate-800 border-slate-700"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                            disabled={loading || !selectedInventoryId}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Sale
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
