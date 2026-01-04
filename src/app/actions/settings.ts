"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateTenantSettings(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user.tenantId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const openingHours = formData.get("openingHours") as string;

    try {
        await prisma.tenant.update({
            where: { id: session.user.tenantId },
            data: { name, address, openingHours },
        });

        revalidatePath("/dashboard/settings");
        revalidatePath(`/pharmacies/${session.user.tenantId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to update settings" };
    }
}
