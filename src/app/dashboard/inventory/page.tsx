import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getTenantPrisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddInventoryDialog } from "@/components/add-inventory-dialog";
import { DeleteInventoryButton } from "@/components/delete-inventory-button";
import { Package, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function InventoryPage() {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user.tenantId!;

    // Use the tenant-aware client for extra safety (data leak prevention)
    const tenantPrisma = getTenantPrisma(tenantId);

    const inventory = await tenantPrisma.inventory.findMany({
        include: { medicine: true },
        orderBy: { updatedAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">Inventory</h2>
                    <p className="text-slate-400">Manage your medicine stock and pricing.</p>
                </div>
                <AddInventoryDialog />
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search inventory..."
                        className="pl-10 bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500"
                    />
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-800/50">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400">Medicine</TableHead>
                            <TableHead className="text-slate-400">Generic Name</TableHead>
                            <TableHead className="text-slate-400">Stock</TableHead>
                            <TableHead className="text-slate-400">Price</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Expiry</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-slate-500 italic">
                                    No items in inventory. Click "Add Product" to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            inventory.map((item) => (
                                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                                    <TableCell className="font-semibold text-slate-100">{item.medicine.name}</TableCell>
                                    <TableCell className="text-slate-400">{item.medicine.genericName || "-"}</TableCell>
                                    <TableCell className="text-slate-200">{item.quantity} units</TableCell>
                                    <TableCell className="text-teal-400 font-medium">${Number(item.price).toFixed(2)}</TableCell>
                                    <TableCell>
                                        {item.quantity <= 0 ? (
                                            <Badge variant="destructive">Out of Stock</Badge>
                                        ) : item.quantity <= item.lowStockThreshold ? (
                                            <Badge variant="outline" className="text-amber-400 border-amber-400/50">Low Stock</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-teal-400 border-teal-400/50">In Stock</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-400">
                                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <AddInventoryDialog mode="edit" item={item as any} />
                                            <DeleteInventoryButton id={item.id} name={item.medicine.name} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
