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
import Link from "next/link";

export default async function SalesPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page: pageStr } = await searchParams;
    const session = await getServerSession(authOptions);
    const tenantId = session?.user.tenantId!;
    const tenantPrisma = getTenantPrisma(tenantId);

    const page = parseInt(pageStr || "1");
    const pageSize = 4;

    const [sales, total] = await Promise.all([
        tenantPrisma.sale.findMany({
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
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        tenantPrisma.sale.count()
    ]);

    const totalPages = Math.ceil(total / pageSize);

    const rawInventory = await tenantPrisma.inventory.findMany({
        where: { quantity: { gt: 0 } },
        include: { medicine: true },
    });

    const inventory = rawInventory.map(item => ({
        ...item,
        price: Number(item.price)
    }));

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

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Link
                        href={`/dashboard/sales?page=${Math.max(1, page - 1)}`}
                        className={`
                            px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-400 rounded-xl text-sm font-bold transition-all
                            ${page === 1 ? 'pointer-events-none opacity-50' : ''}
                        `}
                    >
                        Previous
                    </Link>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                        Page {page} of {totalPages}
                    </span>
                    <Link
                        href={`/dashboard/sales?page=${Math.min(totalPages, page + 1)}`}
                        className={`
                            px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-400 rounded-xl text-sm font-bold transition-all
                            ${page === totalPages ? 'pointer-events-none opacity-50' : ''}
                        `}
                    >
                        Next
                    </Link>
                </div>
            )}
        </div>
    );
}
