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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogSaleDialog } from "@/components/log-sale-dialog";
import { ShoppingCart } from "lucide-react";

export default async function SalesPage() {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user.tenantId!;

    const sales = await prisma.sale.findMany({
        where: { tenantId },
        include: {
            items: {
                include: {
                    inventory: {
                        include: { medicine: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    const inventory = await prisma.inventory.findMany({
        where: { tenantId, quantity: { gt: 0 } },
        include: { medicine: true },
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">Sales History</h2>
                    <p className="text-slate-400">View and log your recent sales transactions.</p>
                </div>
                <LogSaleDialog inventory={inventory} />
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-800/50">
                        <TableRow className="border-slate-800">
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Products</TableHead>
                            <TableHead className="text-slate-400">Total Amount</TableHead>
                            <TableHead className="text-right text-slate-400">ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-slate-500 italic">
                                    No sales recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow key={sale.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                                    <TableCell className="text-slate-300">
                                        {new Date(sale.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-slate-100 italic">
                                        {sale.items.map(item => `${item.inventory.medicine.name} (x${item.quantity})`).join(", ")}
                                    </TableCell>
                                    <TableCell className="text-teal-400 font-bold">
                                        ${Number(sale.totalAmount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-slate-600 font-mono">
                                        {sale.id.slice(-8).toUpperCase()}
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
