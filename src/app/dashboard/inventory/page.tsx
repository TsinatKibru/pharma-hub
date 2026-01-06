import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantPrisma } from "@/lib/prisma";
import { AddInventoryDialog } from "@/components/add-inventory-dialog";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user.tenantId!;

    // Use the tenant-aware client for extra safety (data leak prevention)
    const tenantPrisma = getTenantPrisma(tenantId);

    const rawInventory = await tenantPrisma.inventory.findMany({
        include: { medicine: true },
        orderBy: { updatedAt: "desc" },
    });

    // Convert Decimal to Number for serialization to Client Components
    const inventory = rawInventory.map(item => ({
        ...item,
        price: Number(item.price)
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">Inventory</h2>
                    <p className="text-slate-500 font-medium">Manage your medical stock grid and precision pricing.</p>
                </div>
                <AddInventoryDialog />
            </div>

            <InventoryClient initialItems={inventory} />
        </div>
    );
}
