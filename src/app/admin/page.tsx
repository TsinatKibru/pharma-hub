import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approvePharmacy, rejectPharmacy } from "@/app/actions/admin";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "ADMIN") {
        redirect("/login");
    }

    const pendingPharmacies = await prisma.tenant.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-teal-400">Admin Approval Dashboard</h1>
                    <p className="text-slate-400">Review and activate new pharmacy registrations.</p>
                </header>

                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-800/50">
                            <TableRow>
                                <TableHead className="text-slate-300">Pharmacy Name</TableHead>
                                <TableHead className="text-slate-300">Email</TableHead>
                                <TableHead className="text-slate-300">License</TableHead>
                                <TableHead className="text-slate-300">Address</TableHead>
                                <TableHead className="text-slate-300">Status</TableHead>
                                <TableHead className="text-right text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingPharmacies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                        No pending approvals at the moment.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingPharmacies.map((pharmacy) => (
                                    <TableRow key={pharmacy.id} className="border-slate-800">
                                        <TableCell className="font-semibold">{pharmacy.name}</TableCell>
                                        <TableCell>{pharmacy.email}</TableCell>
                                        <TableCell>{pharmacy.licenseNumber}</TableCell>
                                        <TableCell>{pharmacy.address}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                                                PENDING
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <form action={approvePharmacy.bind(null, pharmacy.id)} className="inline">
                                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">Approve</Button>
                                            </form>
                                            <form action={rejectPharmacy.bind(null, pharmacy.id)} className="inline">
                                                <Button size="sm" variant="destructive">Reject</Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
