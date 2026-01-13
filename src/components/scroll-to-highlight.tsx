"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ScrollToHighlight() {
    const searchParams = useSearchParams();
    const medicineId = searchParams.get("medicineId");

    useEffect(() => {
        if (medicineId) {
            const element = document.getElementById(`medicine-${medicineId}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [medicineId]);

    return null;
}
