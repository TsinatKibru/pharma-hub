"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateTenantSettings } from "@/app/actions/settings";
import { useState } from "react";
import { toast } from "sonner";
import { LocationPicker } from "@/components/map-loader";

export default function SettingsForm({ tenant }: { tenant: any }) {
    const [location, setLocation] = useState({
        lat: tenant.lat || 43.6532,
        lng: tenant.lng || -79.3832
    });

    const handleSubmit = async (formData: FormData) => {
        formData.append("lat", location.lat.toString());
        formData.append("lng", location.lng.toString());

        const result = await updateTenantSettings(formData);
        if (result.success) {
            toast.success("Settings updated successfully");
        } else {
            toast.error("Failed to update settings");
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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
                        <Label htmlFor="openingHours" className="text-xs font-bold text-slate-500 uppercase">Opening Hours</Label>
                        <Input
                            id="openingHours"
                            name="openingHours"
                            defaultValue={tenant.openingHours || ""}
                            placeholder="e.g. 8:00 AM - 10:00 PM"
                            className="bg-slate-900/50 border-slate-800 text-slate-100 py-6"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold text-slate-500 uppercase">Storefront Address</Label>
                    <Input
                        id="address"
                        name="address"
                        defaultValue={tenant.address}
                        className="bg-slate-900/50 border-slate-800 text-slate-100 py-6"
                    />
                </div>

                <div className="space-y-4">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Geographic Location</Label>
                    <LocationPicker
                        defaultLocation={tenant.lat ? { lat: tenant.lat, lng: tenant.lng } : undefined}
                        onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                    />
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-7 uppercase tracking-widest shadow-lg shadow-teal-500/20">
                    Save Pharmacy Configuration
                </Button>
            </div>
        </form>
    );
}
