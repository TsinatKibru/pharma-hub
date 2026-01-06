"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function BusinessHoursEditor({ initialValue }: { initialValue: any }) {
    const [hours, setHours] = useState<any>(initialValue || {});

    const updateDay = (day: string, field: string, value: any) => {
        const newHours = { ...hours };
        if (!newHours[day]) newHours[day] = { open: "08:00", close: "20:00", closed: false };

        if (field === "closed") {
            newHours[day].closed = value;
        } else {
            newHours[day][field] = value;
        }

        setHours(newHours);
    };

    return (
        <div className="space-y-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 flex flex-col gap-4">
            <input type="hidden" name="openingHours" value={JSON.stringify(hours)} />
            {DAYS.map((day) => {
                const dayData = hours[day] || { open: "", close: "", closed: false };
                return (
                    <div key={day} className="grid grid-cols-4 items-center gap-4">
                        <Label className="capitalize text-slate-400 font-bold">{day}</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`closed-${day}`}
                                checked={dayData.closed}
                                onCheckedChange={(checked) => updateDay(day, "closed", checked)}
                            />
                            <Label htmlFor={`closed-${day}`} className="text-[10px] uppercase text-slate-500">Closed</Label>
                        </div>
                        <Input
                            type="time"
                            disabled={dayData.closed}
                            value={dayData.open || ""}
                            onChange={(e) => updateDay(day, "open", e.target.value)}
                            className="bg-slate-800 border-slate-700 text-xs h-8"
                        />
                        <Input
                            type="time"
                            disabled={dayData.closed}
                            value={dayData.close || ""}
                            onChange={(e) => updateDay(day, "close", e.target.value)}
                            className="bg-slate-800 border-slate-700 text-xs h-8"
                        />
                    </div>
                );
            })}
        </div>
    );
}
