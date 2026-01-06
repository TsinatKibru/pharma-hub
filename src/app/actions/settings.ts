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
    const openingHoursStr = formData.get("openingHours") as string;
    let openingHours = null;
    try {
        openingHours = openingHoursStr ? JSON.parse(openingHoursStr) : null;
    } catch (e) {
        openingHours = openingHoursStr; // Fallback to raw string if not JSON
    }
    const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
    const lng = formData.get("lng") ? parseFloat(formData.get("lng") as string) : null;

    try {
        await prisma.tenant.update({
            where: { id: session.user.tenantId },
            data: {
                name,
                address,
                openingHours,
                lat,
                lng
            },
        });

        revalidatePath("/dashboard/settings");
        revalidatePath(`/pharmacies/${session.user.tenantId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to update settings" };
    }
}
