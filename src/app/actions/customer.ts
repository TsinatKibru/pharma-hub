"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const customerRegisterSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export async function registerCustomer(formData: FormData) {
    const data = Object.fromEntries(formData.entries());

    const validatedFields = customerRegisterSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: { general: "A user with this email already exists." } };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: UserRole.PATIENT,
                isActive: true,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Customer registration error detail:", error);
        return { error: { general: "Something went wrong during registration." } };
    }
}
