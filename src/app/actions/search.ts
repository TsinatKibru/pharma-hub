"use server";

import { prisma } from "@/lib/prisma";

export async function searchMedicines(query: string, category?: string) {
    // If both are empty, return nothing
    if (!query && !category) return [];

    try {
        const where: any = {};

        if (query && query.length >= 2) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { genericName: { contains: query, mode: 'insensitive' } },
            ];
        }

        if (category && category !== "all") {
            where.category = category;
        }

        // 1. Find medicines matching the filters
        const medicines = await prisma.medicine.findMany({
            where,
            include: {
                inventories: {
                    where: {
                        tenant: {
                            status: "ACTIVE", // Only show active pharmacies
                        },
                        quantity: { gt: 0 }, // Only show items in stock
                    },
                    include: {
                        tenant: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                address: true,
                                openingHours: true,
                                lat: true,
                                lng: true,
                            }
                        }
                    }
                }
            }
        });

        // 2. Transform the data for the public view
        const results = medicines.map((medicine: any) => {
            const activeInventories = medicine.inventories;
            const prices = activeInventories.map((i: any) => Number(i.price));

            return {
                id: medicine.id,
                name: medicine.name,
                genericName: medicine.genericName,
                imageURL: medicine.imageURL,
                description: medicine.description,
                category: medicine.category,
                priceRange: prices.length > 0 ? {
                    min: Math.min(...prices),
                    max: Math.max(...prices),
                    count: prices.length
                } : null,
                pharmacies: activeInventories.map((i: any) => ({
                    id: i.tenant.id,
                    name: i.tenant.name,
                    slug: i.tenant.slug,
                    address: i.tenant.address,
                    price: Number(i.price),
                    availability: i.quantity > i.lowStockThreshold ? "In Stock" : "Limited Stock",
                    openingHours: i.tenant.openingHours,
                    location: { lat: i.tenant.lat, lng: i.tenant.lng }
                })).sort((a: any, b: any) => a.price - b.price)
            };
        }).filter((m: any) => m.pharmacies.length > 0);

        return results;
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
