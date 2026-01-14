import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if (session.user.role === "ADMIN") {
        redirect("/admin");
    }

    if (session.user.role === "PATIENT") {
        redirect("/search");
    }

    if (session.user.tenantStatus !== "ACTIVE") {
        redirect("/register/success");
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-slate-950 text-slate-100 w-full">
                <AppSidebar user={session.user} />
                <main className="flex-1 overflow-auto p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <SidebarTrigger className="text-slate-400 hover:text-teal-400" />
                        <h1 className="text-2xl font-bold text-teal-400 uppercase tracking-widest">PharmaHub</h1>
                    </div>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
