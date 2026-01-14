"use client";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronRight,
    User,
    History as HistoryIcon,
    CalendarDays
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar({ user }: { user: any }) {
    const pathname = usePathname();

    const items = user.role === "ADMIN"
        ? [
            { title: "Admin Panel", url: "/admin", icon: LayoutDashboard },
            { title: "Global Settings", url: "/admin/settings", icon: Settings }, // Example for admin
        ]
        : [
            { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
            { title: "Inventory", url: "/dashboard/inventory", icon: Package },
            { title: "Bookings", url: "/dashboard/bookings", icon: CalendarDays },
            { title: "Stock History", url: "/dashboard/history", icon: HistoryIcon },
            { title: "Sales", url: "/dashboard/sales", icon: ShoppingCart },
            { title: "Settings", url: "/dashboard/settings", icon: Settings },
        ];

    return (
        <Sidebar className="border-r border-slate-900 bg-[#020617] shadow-none">
            <SidebarHeader className="p-8 bg-[#020617]">
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-900/40 flex items-center justify-center text-teal-400 font-black text-2xl shadow-lg border border-teal-500/20">
                        P
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-100 text-base tracking-tighter uppercase leading-none mb-1">PharmaHub</span>
                        <span className="text-[10px] text-teal-600 font-black uppercase tracking-[0.25em] leading-none">Premium</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-[#020617] px-4">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-8">
                        Management
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        className={`
                                            flex items-center gap-4 px-4 py-8 rounded-2xl transition-all duration-300
                                            ${pathname === item.url
                                                ? "bg-teal-500/10 text-teal-400 shadow-[inset_0_0_20px_rgba(20,184,166,0.03)]"
                                                : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/40"}
                                        `}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className={`h-5 w-5 ${pathname === item.url ? "text-teal-400" : "text-slate-600"}`} />
                                            <span className="font-bold tracking-tight text-sm">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-8 bg-[#020617] space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <div className="h-10 w-10 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-slate-800/50 shadow-inner">
                        <User className="h-5 w-5 text-teal-700" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-200 truncate w-32 tracking-tight">{user.email}</span>
                        <span className="text-[9px] text-teal-800 font-black uppercase tracking-[0.2em]">{user.role}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 text-slate-600 hover:text-red-400 hover:bg-red-400/5 rounded-2xl py-8 px-6 shadow-sm border border-transparent hover:border-red-400/10 transition-all"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-black text-xs uppercase tracking-widest">Sign Out</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
