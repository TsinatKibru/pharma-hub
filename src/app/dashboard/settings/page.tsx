import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SettingsForm from "./settings-form";

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
                    <CardTitle className="text-sm font-black text-teal-500 uppercase tracking-widest">Pharmacy Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <SettingsForm tenant={tenant} />
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
