const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 1. Seed Admin
    const admin = await prisma.user.upsert({
        where: { email: "admin@pharmahub.com" },
        update: {},
        create: {
            email: "admin@pharmahub.com",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    // 2. Seed Medicines with Categories
    const medicines = [
        { name: "Amoxicillin", genericName: "Amoxicillin 500mg", category: "antibiotics", description: "Broad-spectrum antibiotic" },
        { name: "Panadol", genericName: "Paracetamol 500mg", category: "pain relief", description: "Fever and pain relief" },
        { name: "Lisinopril", genericName: "Lisinopril 10mg", category: "cardiac", description: "Heart medicine" },
        { name: "Centrum", genericName: "Multivitamins", category: "vitamins", description: "Daily vitamins" },
        { name: "Ventolin", genericName: "Salbutamol", category: "respiratory", description: "Asthma inhaler" },
        { name: "Augmentin", genericName: "Amoxicillin/Clavulanate", category: "antibiotics", description: "Combination antibiotic" },
        { name: "Ibuprofen", genericName: "Advil/Motrin 200mg", category: "pain relief", description: "Anti-inflammatory pain relief" },
        { name: "Atorvastatin", genericName: "Lipitor 20mg", category: "cardiac", description: "Cholesterol medicine" },
        { name: "Vitamin C", genericName: "Ascorbic Acid 500mg", category: "vitamins", description: "Immune support" },
        { name: "Fluticasone", genericName: "Flonase", category: "respiratory", description: "Nasal allergy spray" },
        { name: "Hydrocortisone", genericName: "Cortizone-10", category: "dermatology", description: "Itch relief cream" },
        { name: "Zyrtec", genericName: "Cetirizine 10mg", category: "respiratory", description: "Allergy relief" },
    ];

    const seededMedicines = [];
    for (const med of medicines) {
        const m = await prisma.medicine.upsert({
            where: { id: med.name }, // This is dummy just for upsert logic, better use findUnique if actual IDs unknown
            update: med,
            create: med,
            // Actually since medicine has no unique constraint on name besides id, we use findFirst then create
        });

        // Correct approach for name uniqueness in seed
        let medicine = await prisma.medicine.findFirst({ where: { name: med.name } });
        if (!medicine) {
            medicine = await prisma.medicine.create({ data: med });
        }
        seededMedicines.push(medicine);
    }

    // 3. Seed Tenants with Structured Opening Hours
    const openingHours = {
        monday: { open: "08:00", close: "20:00" },
        tuesday: { open: "08:00", close: "20:00" },
        wednesday: { open: "08:00", close: "20:00" },
        thursday: { open: "08:00", close: "20:00" },
        friday: { open: "08:00", close: "12:00" }, // Short day
        saturday: { closed: true },
        sunday: { closed: true },
    };

    const tenants = [
        {
            name: "City Central Pharmacy",
            email: "city@pharmacy.com",
            slug: "city-central",
            address: "123 Main St, Central District",
            lat: 30.0444,
            lng: 31.2357,
            status: "ACTIVE",
            openingHours
        },
        {
            name: "Westside Meds",
            email: "west@pharmacy.com",
            slug: "westside-meds",
            address: "45 West Ave, Garden City",
            lat: 30.0333,
            lng: 31.2167,
            status: "ACTIVE",
            openingHours: { ...openingHours, saturday: { open: "10:00", close: "16:00" }, sunday: { open: "10:00", close: "16:00" } }
        }
    ];

    for (const t of tenants) {
        const tenant = await prisma.tenant.upsert({
            where: { email: t.email },
            update: t,
            create: t,
        });

        // Seed Owner for each tenant
        const user = await prisma.user.upsert({
            where: { email: `owner@${t.slug}.com` },
            update: {},
            create: {
                email: `owner@${t.slug}.com`,
                password: hashedPassword,
                role: "OWNER",
                tenantId: tenant.id
            }
        });

        // 4. Seed Inventory and Movements
        for (const med of seededMedicines) {
            const inventory = await prisma.inventory.upsert({
                where: {
                    tenantId_medicineId: {
                        tenantId: tenant.id,
                        medicineId: med.id
                    }
                },
                update: {
                    price: 10 + Math.random() * 20,
                    quantity: 50 + Math.floor(Math.random() * 100),
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1 + Math.floor(Math.random() * 2))),
                },
                create: {
                    tenantId: tenant.id,
                    medicineId: med.id,
                    price: 10 + Math.random() * 20,
                    quantity: 100,
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                }
            });

            // Initial movement
            await prisma.stockMovement.create({
                data: {
                    inventoryId: inventory.id,
                    userId: user.id,
                    type: "INITIAL",
                    quantity: 100,
                    reason: "Initial seed stock"
                }
            });
        }
    }

    console.log("Database seeded successfully with Phase 1 data.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
