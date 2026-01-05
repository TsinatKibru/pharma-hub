"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approvePharmacy, rejectPharmacy } from "@/app/actions/admin";
import { toast } from "sonner";

interface PharmacyActionsProps {
    pharmacyId: string;
}

export function PharmacyActions({ pharmacyId }: PharmacyActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approvePharmacy(pharmacyId);
            if (result.success) {
                toast.success("Pharmacy approved successfully");
            } else {
                toast.error(result.error || "Failed to approve pharmacy");
            }
        });
    };

    const handleReject = () => {
        startTransition(async () => {
            const result = await rejectPharmacy(pharmacyId);
            if (result.success) {
                toast.success("Pharmacy rejected");
            } else {
                toast.error(result.error || "Failed to reject pharmacy");
            }
        });
    };

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleApprove}
                disabled={isPending}
            >
                {isPending ? "Processing..." : "Approve"}
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isPending}
            >
                {isPending ? "Processing..." : "Reject"}
            </Button>
        </div>
    );
}
