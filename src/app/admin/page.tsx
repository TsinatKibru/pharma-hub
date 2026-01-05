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
import { Badge } from "@/components/ui/badge";
import { PharmacyActions } from "./_components/PharmacyActions";

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
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] uppercase font-black tracking-widest px-3 py-1">Focus Mode</Badge>
                            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Pending Approvals Only</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Access Control</h1>
                        <p className="text-slate-500 font-medium mt-1">Review and gatekeep pharma entity registrations.</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 text-center">Active Queue</p>
                        <p className="text-3xl font-black text-teal-500 text-center font-mono">{pendingPharmacies.length}</p>
                    </div>
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
                                        <TableCell className="text-right">
                                            <PharmacyActions pharmacyId={pharmacy.id} />
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
