import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Smartphone, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user.tenantId!;

    // Fetch stats for the tenant
    const [totalInventories, lowStockCount, totalSalesToday, recentSales, inventoryCounts] = await Promise.all([
        prisma.inventory.count({ where: { tenantId } }),
        prisma.inventory.count({
            where: {
                tenantId,
                quantity: {
                    gt: 0,
                    lt: prisma.inventory.fields.lowStockThreshold
                }
            }
        }),
        prisma.sale.aggregate({
            where: {
                tenantId,
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            },
            _sum: { totalAmount: true }
        }),
        prisma.sale.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { items: { include: { inventory: { include: { medicine: true } } } } }
        }),
        prisma.inventory.groupBy({
            by: ['quantity', 'lowStockThreshold'],
            where: { tenantId },
            _count: { _all: true }
        })
    ]);

    // Simple status calculation
    const outOfStock = await prisma.inventory.count({ where: { tenantId, quantity: 0 } });
    const inStock = totalInventories - lowStockCount - outOfStock;

    const stats = [
        {
            title: "Total Products",
            value: totalInventories,
            icon: Package,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        {
            title: "Low Stock Items",
            value: lowStockCount,
            icon: AlertTriangle,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
        },
        {
            title: "Sales Today",
            value: `$${(totalSalesToday._sum.totalAmount || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-teal-400",
            bg: "bg-teal-400/10",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100 uppercase tracking-widest">Dashboard Console</h2>
                <p className="text-slate-500 font-medium">Real-time inventory and sales telemetry.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-slate-900 bg-[#0c1120] shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-100 font-mono tracking-tighter">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-slate-900 bg-[#0c1120] shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-black text-teal-500 uppercase tracking-widest">Recent Sales Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentSales.length === 0 ? (
                            <p className="text-sm text-slate-600 italic py-8 text-center">No recent sales records found.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between p-4 border border-slate-800/50 rounded-xl bg-slate-900/30">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-300">
                                                {sale.items[0]?.inventory.medicine.name} {sale.items.length > 1 ? `(+${sale.items.length - 1} more)` : ""}
                                            </span>
                                            <span className="text-[10px] text-slate-600 font-medium">{new Date(sale.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <span className="text-sm font-black text-teal-400">${Number(sale.totalAmount).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-slate-900 bg-[#0c1120] shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-black text-teal-500 uppercase tracking-widest">Stock Health Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                                <span className="text-teal-500">Healthy Stock</span>
                                <span className="text-slate-400">{inStock} Items</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all" style={{ width: `${(inStock / totalInventories) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                                <span className="text-amber-500">Low Stock</span>
                                <span className="text-slate-400">{lowStockCount} Items</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all" style={{ width: `${(lowStockCount / totalInventories) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                                <span className="text-red-500">Out of Stock</span>
                                <span className="text-slate-400">{outOfStock} Items</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all" style={{ width: `${(outOfStock / totalInventories) * 100}%` }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
