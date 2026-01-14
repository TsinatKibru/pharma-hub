"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@prisma/client";

export async function createBooking(data: {
    inventoryId: string;
    quantity: number;
    tenantId: string;
}) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return { error: "You must be logged in to book a pick-up." };
        }

        // Check if inventory exists and has enough stock
        const inventory = await prisma.inventory.findUnique({
            where: { id: data.inventoryId },
        });

        if (!inventory || inventory.quantity < data.quantity) {
            return { error: "Insufficient stock available." };
        }

        // Generate a 6-digit alphanumeric pickup code
        const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const booking = await prisma.booking.create({
            data: {
                inventoryId: data.inventoryId,
                quantity: data.quantity,
                tenantId: data.tenantId,
                userId: session.user.id,
                pickupCode,
                status: "PENDING",
            },
        });

        revalidatePath(`/pharmacies/[slug]`);
        return booking;
    } catch (error) {
        console.error("Booking error:", error);
        return { error: "Failed to create booking. Please try again." };
    }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    // If marking as COMPLETED, we should probably reduce the stock
    // However, for this MVP, we might just keep it as a reservation.
    // If we want to be "professional", we should reduce inventory only when COMPLETED.

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { inventory: true }
    });

    if (!booking || booking.tenantId !== session.user.tenantId) {
        throw new Error("Booking not found or unauthorized");
    }

    // Atomic update of status
    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
    });

    revalidatePath("/dashboard/bookings");
    return updatedBooking;
}

export async function getPharmacyBookings() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    return await prisma.booking.findMany({
        where: {
            tenantId: session.user.tenantId,
        },
        include: {
            inventory: {
                include: {
                    medicine: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                }
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getUserBookings() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return await prisma.booking.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            inventory: {
                include: {
                    medicine: true,
                    tenant: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
