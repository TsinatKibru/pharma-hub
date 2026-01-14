import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPharmacyBookings } from "@/app/actions/bookings";
import { BookingsClient } from "./bookings-client";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const rawBookings = await getPharmacyBookings();

    // Serialize bookings for Client Component
    const bookings = rawBookings.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        inventory: {
            ...b.inventory,
            price: Number(b.inventory.price),
            createdAt: b.inventory.createdAt.toISOString(),
            updatedAt: b.inventory.updatedAt.toISOString(),
            expiryDate: b.inventory.expiryDate?.toISOString() || null,
            medicine: {
                ...b.inventory.medicine,
                createdAt: b.inventory.medicine.createdAt.toISOString(),
                updatedAt: b.inventory.medicine.updatedAt.toISOString(),
            }
        }
    }));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100 uppercase tracking-widest leading-none mb-3">Pick-up Reservations</h2>
                <p className="text-slate-500 font-medium">Manage incoming medicine bookings and update patient fulfillment status.</p>
            </div>

            <BookingsClient initialBookings={bookings} />
        </div>
    );
}
