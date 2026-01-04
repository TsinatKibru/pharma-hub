"use server";

import { prisma, getTenantPrisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inventorySchema = z.object({
    medicineName: z.string().min(2, "Medicine name is required"),
    genericName: z.string().optional(),
    price: z.coerce.number().positive("Price must be positive"),
    quantity: z.coerce.number().int().nonnegative("Quantity cannot be negative"),
    lowStockThreshold: z.coerce.number().int().nonnegative().default(10),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional(),
});

export async function addInventoryItem(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) throw new Error("Unauthorized");

    const tenantId = session.user.tenantId;
    const data = Object.fromEntries(formData.entries());
    const validated = inventorySchema.safeParse(data);

    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    const { medicineName, genericName, price, quantity, lowStockThreshold, batchNumber, expiryDate } = validated.data;

    try {
        // 1. Find or create the global Medicine definition
        let medicine = await prisma.medicine.findFirst({
            where: { name: { equals: medicineName, mode: 'insensitive' } }
        });

        if (!medicine) {
            medicine = await prisma.medicine.create({
                data: { name: medicineName, genericName }
            });
        }

        // 2. Add to Tenant Inventory
        await prisma.inventory.upsert({
            where: {
                tenantId_medicineId: {
                    tenantId,
                    medicineId: medicine.id
                }
            },
            update: {
                price,
                quantity: { increment: quantity },
                lowStockThreshold,
                batchNumber,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
            create: {
                tenantId,
                medicineId: medicine.id,
                price,
                quantity,
                lowStockThreshold,
                batchNumber,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            }
        });

        revalidatePath("/dashboard/inventory");
        return { success: true };
    } catch (error) {
        console.error("Inventory add error:", error);
        return { error: { general: "Failed to add inventory item" } };
    }
}
