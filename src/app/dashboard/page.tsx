import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Smartphone, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user.tenantId!;

    // Fetch stats for the tenant
    const [totalInventories, lowStockCount, totalSalesToday] = await Promise.all([
        prisma.inventory.count({ where: { tenantId } }),
        prisma.inventory.count({
            where: {
                tenantId,
                quantity: { lt: prisma.inventory.fields.lowStockThreshold }
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
        })
    ]);

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
                <h2 className="text-3xl font-bold tracking-tight text-slate-100">Welcome to PharmaHub</h2>
                <p className="text-slate-400">Inventory overview for your pharmacy.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-slate-800 bg-slate-900/50 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-teal-400">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 italic">No recent sales records found.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-teal-400">Inventory Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[200px]">
                        <p className="text-sm text-slate-500 italic">Add products to see distribution.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
