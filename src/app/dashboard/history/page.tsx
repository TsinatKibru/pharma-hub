import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma, getTenantPrisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, User as UserIcon, Calendar, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function StockHistoryPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string, query?: string }>
}) {
    const { page: pageStr, query: queryStr } = await searchParams;
    const session = await getServerSession(authOptions);
    const tenantId = session?.user.tenantId!;
    const tenantPrisma = getTenantPrisma(tenantId);

    const page = parseInt(pageStr || "1");
    const pageSize = 10;
    const query = queryStr || "";

    // Bypass TS check for stockMovement if it's being stubborn, but use tenantPrisma for safety
    const movementModel = (tenantPrisma as any).stockMovement;

    if (!movementModel) {
        throw new Error("Critical: StockMovement model not found in Prisma Client. Please run 'npx prisma generate' and restart the server.");
    }

    const [movements, total] = await Promise.all([
        movementModel.findMany({
            where: query ? {
                inventory: {
                    medicine: {
                        name: { contains: query, mode: 'insensitive' }
                    }
                }
            } : {},
            include: {
                inventory: {
                    include: {
                        medicine: true
                    }
                },
                user: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: (page - 1) * pageSize,
            take: pageSize
        }),
        movementModel.count({
            where: query ? {
                inventory: {
                    medicine: {
                        name: { contains: query, mode: 'insensitive' }
                    }
                }
            } : {}
        })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">Stock History</h2>
                <p className="text-slate-500 font-medium">Audit trail of all inventory movements and adjustments.</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
                <form className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        name="query"
                        placeholder="Search history by medicine name..."
                        defaultValue={query}
                        className="pl-10 bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500 rounded-xl"
                    />
                </form>
                <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-400 hover:text-teal-400 rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-800/30">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Medicine</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Type</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">In/Out</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Administered By</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Timestamp</TableHead>
                            <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest p-6">Reason</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-24 text-slate-500 italic">
                                    <div className="flex flex-col items-center gap-4">
                                        <History className="h-12 w-12 opacity-5" />
                                        <p className="uppercase font-black text-[10px] tracking-[0.3em]">No movement cycles detected</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            movements.map((move: any) => (
                                <TableRow key={move.id} className="border-slate-800 hover:bg-slate-800/20 transition-all">
                                    <TableCell className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-100">{move.inventory.medicine.name}</span>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{move.inventory.medicine.genericName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-6">
                                        <Badge className={`
                                            font-black text-[9px] uppercase px-2 border-none
                                            ${move.type === 'SALE' ? 'bg-rose-500/10 text-rose-500' :
                                                move.type === 'RESTOCK' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    move.type === 'INITIAL' ? 'bg-teal-500/10 text-teal-500' :
                                                        'bg-slate-500/10 text-slate-400'}
                                        `}>
                                            {move.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`p-6 font-mono font-bold ${move.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                                    </TableCell>
                                    <TableCell className="p-6">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <UserIcon className="h-3 w-3 text-teal-700" />
                                            {move.user?.email || "System"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-6">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(move.createdAt).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-6 text-slate-500 italic text-xs">
                                        {move.reason || "-"}
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
                        href={`/dashboard/history?page=${Math.max(1, page - 1)}&query=${query}`}
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
                        href={`/dashboard/history?page=${Math.min(totalPages, page + 1)}&query=${query}`}
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
