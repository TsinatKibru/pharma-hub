import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateTenantSettings } from "@/app/actions/settings";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    const tenant = await prisma.tenant.findUnique({
        where: { id: session?.user.tenantId! },
    });

    if (!tenant) return null;

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100 uppercase tracking-widest">Pharmacy Settings</h2>
                <p className="text-slate-500 font-medium">Manage your public profile and pharmacy details.</p>
            </div>

            <Card className="border-slate-900 bg-[#0c1120] shadow-xl">
                <CardHeader>
                    <CardTitle className="text-sm font-black text-teal-500 uppercase tracking-widest">General Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateTenantSettings} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Pharmacy Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={tenant.name}
                                className="bg-slate-900/50 border-slate-800 text-slate-100 py-6"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-xs font-bold text-slate-500 uppercase">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                defaultValue={tenant.address}
                                className="bg-slate-900/50 border-slate-800 text-slate-100 py-6"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="openingHours" className="text-xs font-bold text-slate-500 uppercase">Opening Hours</Label>
                            <Input
                                id="openingHours"
                                name="openingHours"
                                defaultValue={tenant.openingHours || ""}
                                placeholder="e.g. 8:00 AM - 10:00 PM"
                                className="bg-slate-900/50 border-slate-800 text-slate-100 py-6"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 uppercase tracking-widest">
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-red-900/20 bg-red-950/5 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-sm font-black text-red-500 uppercase tracking-widest">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-slate-500 mb-4 font-medium italic">Deleting your pharmacy account is permanent and cannot be undone.</p>
                    <Button variant="destructive" className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 py-6 font-bold uppercase tracking-widest">
                        Request Account Deletion
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
