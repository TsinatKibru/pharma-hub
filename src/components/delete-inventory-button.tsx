"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteInventoryItem } from "@/app/actions/inventory";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function DeleteInventoryButton({ id, name }: { id: string, name: string }) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await deleteInventoryItem(id);
        setLoading(false);

        if (result.success) {
            toast.success(`${name} removed from inventory`);
        } else {
            toast.error("Failed to delete item");
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Product?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        This will permanently remove <span className="text-teal-400 font-bold">{name}</span> from your public inventory. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove Product"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
