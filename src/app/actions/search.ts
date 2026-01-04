"use server";

import { prisma } from "@/lib/prisma";

export async function searchMedicines(query: string) {
    if (!query || query.length < 2) return [];

    try {
        // 1. Find medicines matching the query (brand name or generic name)
        const medicines = await prisma.medicine.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { genericName: { contains: query, mode: 'insensitive' } },
                ],
            },
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

        // 2. Transform the data for the public view (hide exact quantities, add price range)
        const results = medicines.map((medicine) => {
            const activeInventories = medicine.inventories;
            const prices = activeInventories.map(i => Number(i.price));

            return {
                id: medicine.id,
                name: medicine.name,
                genericName: medicine.genericName,
                imageURL: medicine.imageURL,
                description: medicine.description,
                priceRange: prices.length > 0 ? {
                    min: Math.min(...prices),
                    max: Math.max(...prices),
                    count: prices.length
                } : null,
                pharmacies: activeInventories.map(i => ({
                    id: i.tenant.id,
                    name: i.tenant.name,
                    slug: i.tenant.slug,
                    address: i.tenant.address,
                    price: Number(i.price),
                    availability: i.quantity > i.lowStockThreshold ? "In Stock" : "Limited Stock",
                    openingHours: i.tenant.openingHours,
                    location: { lat: i.tenant.lat, lng: i.tenant.lng }
                })).sort((a, b) => a.price - b.price) // Sort by price ascending
            };
        }).filter(m => m.pharmacies.length > 0);

        return results;
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
