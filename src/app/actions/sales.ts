"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateStockAtomic } from "@/lib/inventory-utils";
import { z } from "zod";

const saleSchema = z.object({
    inventoryId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
    unitPrice: z.coerce.number().positive("Price must be positive"),
});

export async function logSale(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) throw new Error("Unauthorized");

    const tenantId = session.user.tenantId;
    const data = Object.fromEntries(formData.entries());
    const validated = saleSchema.safeParse(data);

    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    const { inventoryId, quantity, unitPrice } = validated.data;
    const totalAmount = quantity * unitPrice;

    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Get the inventory item to find the medicineId - STRICT TENANT SCOPING
            const inventory = await tx.inventory.findUnique({
                where: {
                    id: inventoryId,
                    tenantId: tenantId // Critical: Ensure the item belongs to THIS tenant
                },
                select: { medicineId: true, quantity: true }
            });

            if (!inventory) throw new Error("Product not found or unauthorized");
            if (inventory.quantity < quantity) throw new Error("Insufficient stock");

            // 2. Atomic stock update (using our helper logic inside transaction)
            // Note: We'll repeat the update logic here to stay within the same transaction object 'tx'
            await tx.$executeRaw`
                UPDATE "Inventory"
                SET "quantity" = "quantity" - ${quantity}, "updatedAt" = NOW()
                WHERE "id" = ${inventoryId} 
                AND "tenantId" = ${tenantId}
                AND "quantity" >= ${quantity}
            `;

            // 3. Create Sale record
            const sale = await tx.sale.create({
                data: {
                    tenantId,
                    totalAmount,
                    items: {
                        create: {
                            inventoryId,
                            quantity,
                            unitPrice,
                        }
                    }
                }
            });

            revalidatePath("/dashboard/sales");
            revalidatePath("/dashboard");
            return { success: true, saleId: sale.id };
        });
    } catch (error: any) {
        console.error("Sale logging error:", error);
        return { error: { general: error.message || "Failed to log sale" } };
    }
}
