"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    pharmacyName: z.string().min(2, "Pharmacy name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().min(5, "Address is required"),
    licenseNumber: z.string().min(1, "License number is required"),
});

export async function registerPharmacy(formData: FormData) {
    const data = Object.fromEntries(formData.entries());

    const validatedFields = registerSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { pharmacyName, email, password, address, licenseNumber } = validatedFields.data;

    try {
        // Check if pharmacy/user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: { general: "A user with this email already exists." } };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const slug = pharmacyName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        // Handle File Upload
        const licenseFile = formData.get("licenseFile") as File;
        let licenseUrl = null;

        if (licenseFile && licenseFile.size > 0) {
            const arrayBuffer = await licenseFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const { uploadToCloudinary } = await import("@/lib/cloudinary");
            licenseUrl = await uploadToCloudinary(buffer, "licenses") as string;
        }

        // Create Tenant and User in a transaction
        await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: pharmacyName,
                    email,
                    slug,
                    address,
                    licenseNumber,
                    licenseUrl,
                    status: "PENDING",
                },
            });

            await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: "OWNER",
                    tenantId: tenant.id,
                },
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: { general: "Something went wrong during registration." } };
    }
}
