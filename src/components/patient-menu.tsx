"use client";

import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Package } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PatientBookingsDialog } from "./patient-bookings-dialog";

export function PatientMenu() {
    const { data: session } = useSession();
    const [showBookings, setShowBookings] = useState(false);

    if (!session || session.user.role !== "PATIENT") {
        return null;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:text-teal-400 focus:ring-0 focus:ring-offset-0">
                        <User className="h-5 w-5" />
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-teal-500 border-2 border-slate-900" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#0c1120] border-slate-800 text-slate-100" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{session.user.email?.split('@')[0]}</p>
                            <p className="text-xs leading-none text-slate-500 truncate">{session.user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem
                        onClick={() => setShowBookings(true)}
                        className="cursor-pointer focus:bg-slate-800 focus:text-teal-400"
                    >
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <PatientBookingsDialog open={showBookings} onOpenChange={setShowBookings} />
        </>
    );
}
