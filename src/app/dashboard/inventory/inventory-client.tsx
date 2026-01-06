"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddInventoryDialog } from "@/components/add-inventory-dialog";
import { DeleteInventoryButton } from "@/components/delete-inventory-button";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InventoryClient({ initialItems }: { initialItems: any[] }) {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "low" | "out" | "in">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const filteredItems = initialItems.filter(item => {
        const matchesSearch = item.medicine.name.toLowerCase().includes(search.toLowerCase()) ||
            item.medicine.genericName?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filterStatus === "low") return item.quantity > 0 && item.quantity <= item.lowStockThreshold;
        if (filterStatus === "out") return item.quantity <= 0;
        if (filterStatus === "in") return item.quantity > item.lowStockThreshold;

        return true;
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (status: "all" | "low" | "out" | "in") => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search inventory by medicine name or generic name..."
                        value={search}
                        onChange={handleSearchChange}
                        className="pl-10 bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500 rounded-xl"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="border-slate-800 bg-slate-900 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            {filterStatus === "all" ? "All Items" :
                                filterStatus === "low" ? "Low Stock" :
                                    filterStatus === "out" ? "Out of Stock" : "In Stock"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-900 border-slate-800 text-slate-100">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem onClick={() => handleFilterChange("all")}>All Items</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterChange("in")} className="text-teal-400">In Stock</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterChange("low")} className="text-amber-500">Low Stock</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterChange("out")} className="text-rose-500">Out of Stock</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-800/30">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Medicine</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Generic Name</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Stock Level</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Price</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Status</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Expiry</TableHead>
                            <TableHead className="text-right text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20 text-slate-500 italic">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 opacity-10" />
                                        <p>No matching inventory items found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedItems.map((item) => (
                                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/20 transition-all group">
                                    <TableCell className="font-bold text-slate-100 p-6 group-hover:text-teal-400 transition-colors">{item.medicine.name}</TableCell>
                                    <TableCell className="text-slate-500 p-6 font-medium">{item.medicine.genericName || "-"}</TableCell>
                                    <TableCell className="p-6">
                                        <span className="font-mono text-slate-300 font-bold">{item.quantity}</span>
                                        <span className="text-[10px] text-slate-600 ml-1 uppercase font-black">UNITS</span>
                                    </TableCell>
                                    <TableCell className="text-teal-400 font-black p-6 tracking-tighter text-lg font-mono">
                                        ${Number(item.price).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="p-6">
                                        {item.quantity <= 0 ? (
                                            <Badge className="bg-rose-500/10 text-rose-500 border-none font-black text-[9px] uppercase px-2">Out of Stock</Badge>
                                        ) : item.quantity <= item.lowStockThreshold ? (
                                            <Badge className="bg-amber-500/10 text-amber-500 border-none font-black text-[9px] uppercase px-2">Low Stock</Badge>
                                        ) : (
                                            <Badge className="bg-teal-500/10 text-teal-500 border-none font-black text-[9px] uppercase px-2">In Stock</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-400 p-6 font-mono text-xs">
                                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right p-6">
                                        <div className="flex justify-end gap-2">
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

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="bg-slate-900 border-slate-800 text-slate-400 hover:text-teal-400 rounded-xl"
                    >
                        Previous
                    </Button>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="bg-slate-900 border-slate-800 text-slate-400 hover:text-teal-400 rounded-xl"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
