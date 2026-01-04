import { prisma, getTenantPrisma } from "@/lib/prisma";

/**
 * Atomically updates stock for a medicine in a specific tenant's inventory.
 * Uses Prisma's raw update to ensure atomicity and prevent race conditions.
 */
export async function updateStockAtomic(tenantId: string, medicineId: string, quantityChange: number) {
    // quantityChange can be negative for sales, positive for restock

    return await prisma.$transaction(async (tx) => {
        // We use a raw query here to ensure the update is atomic at the DB level
        // This prevents the "read-modify-write" race condition.
        const result = await tx.$executeRaw`
      UPDATE "Inventory"
      SET 
        "quantity" = "quantity" + ${quantityChange},
        "updatedAt" = NOW()
      WHERE "tenantId" = ${tenantId} 
      AND "medicineId" = ${medicineId}
      AND ("quantity" + ${quantityChange}) >= 0
    `;

        if (result === 0) {
            throw new Error("Insufficient stock or inventory not found");
        }

        return true;
    });
}
