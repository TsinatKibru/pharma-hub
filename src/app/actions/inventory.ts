"use server";

import { prisma } from "@/lib/prisma";
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
        let medicine = await prisma.medicine.findFirst({
            where: { name: { equals: medicineName, mode: 'insensitive' } }
        });

        if (!medicine) {
            medicine = await prisma.medicine.create({
                data: { name: medicineName, genericName }
            });
        }

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

export async function updateInventoryItem(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) throw new Error("Unauthorized");

    const tenantId = session.user.tenantId;
    const data = Object.fromEntries(formData.entries());
    const inventoryId = formData.get("id") as string;

    const validated = inventorySchema.safeParse(data);
    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    const { price, quantity, lowStockThreshold, batchNumber, expiryDate } = validated.data;

    try {
        await prisma.inventory.update({
            where: {
                id: inventoryId,
                tenantId
            },
            data: {
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
        console.error("Inventory update error:", error);
        return { error: { general: "Failed to update inventory item" } };
    }
}

export async function deleteInventoryItem(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) throw new Error("Unauthorized");

    try {
        await prisma.inventory.delete({
            where: {
                id,
                tenantId: session.user.tenantId
            }
        });

        revalidatePath("/dashboard/inventory");
        return { success: true };
    } catch (error) {
        console.error("Inventory delete error:", error);
        return { error: "Failed to delete item" };
    }
}
