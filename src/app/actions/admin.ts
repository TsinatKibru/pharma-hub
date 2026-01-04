"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approvePharmacy(tenantId: string) {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { status: "ACTIVE" },
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Approval error:", error);
        return { error: "Failed to approve pharmacy" };
    }
}

export async function rejectPharmacy(tenantId: string) {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { status: "REJECTED" },
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Rejection error:", error);
        return { error: "Failed to reject pharmacy" };
    }
}
