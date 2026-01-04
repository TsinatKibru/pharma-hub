"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerPharmacy } from "@/app/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function RegisterPage() {
    const [error, setError] = useState<Record<string, string[] | string> | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await registerPharmacy(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/register/success");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-teal-400">
                        Join PharmaHub
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Register your pharmacy to manage inventory and reach more customers.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error?.general && (
                            <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200">
                                <AlertDescription>{error.general as string}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                            <Input
                                id="pharmacyName"
                                name="pharmacyName"
                                placeholder="City Central Pharmacy"
                                required
                                className="bg-slate-800 border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                            />
                            {error?.pharmacyName && (
                                <p className="text-xs text-red-400">{(error.pharmacyName as string[])[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                className="bg-slate-800 border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                            />
                            {error?.email && (
                                <p className="text-xs text-red-400">{(error.email as string[])[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-slate-800 border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                            />
                            {error?.password && (
                                <p className="text-xs text-red-400">{(error.password as string[])[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License Number</Label>
                            <Input
                                id="licenseNumber"
                                name="licenseNumber"
                                placeholder="PH-12345678"
                                required
                                className="bg-slate-800 border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                            />
                            {error?.licenseNumber && (
                                <p className="text-xs text-red-400">{(error.licenseNumber as string[])[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Physical Address</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="123 Health St, Medical District"
                                required
                                className="bg-slate-800 border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                            />
                            {error?.address && (
                                <p className="text-xs text-red-400">{(error.address as string[])[0]}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Create Account"}
                        </Button>
                        <div className="text-center text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-teal-400 hover:underline hover:text-teal-300">
                                Sign In
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
