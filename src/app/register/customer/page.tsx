"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerCustomer } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";

export default function CustomerRegisterPage() {
    const [error, setError] = useState<Record<string, string[] | string> | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await registerCustomer(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/login?registered=true");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-[#0c1120] text-slate-100 shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-blue-600" />
                <CardHeader className="space-y-1 p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <User className="h-6 w-6 text-teal-500" />
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-white uppercase">
                            Patient Sign Up
                        </CardTitle>
                    </div>
                    <CardDescription className="text-slate-400 font-medium italic">
                        Create an account to reserve medicines and track your bookings.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 px-8 py-0">
                        {error?.general && (
                            <Alert variant="destructive" className="bg-rose-900/20 border-rose-900/50 text-rose-200 rounded-xl">
                                <AlertDescription className="font-bold text-xs uppercase tracking-widest">{error.general as string}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="your-email@example.com"
                                    required
                                    className="bg-slate-900/50 border-slate-800 focus:border-teal-500 focus:ring-teal-500 pl-10 h-12 rounded-xl text-slate-200"
                                />
                            </div>
                            {error?.email && (
                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{(error.email as string[])[0]}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="password" university-id="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="bg-slate-900/50 border-slate-800 focus:border-teal-500 focus:ring-teal-500 pl-10 h-12 rounded-xl text-slate-200"
                                />
                            </div>
                            {error?.password && (
                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{(error.password as string[])[0]}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="bg-slate-900/50 border-slate-800 focus:border-teal-500 focus:ring-teal-500 pl-10 h-12 rounded-xl text-slate-200"
                                />
                            </div>
                            {error?.confirmPassword && (
                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{(error.confirmPassword as string[])[0]}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-6 pt-10 p-8">
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-[0.2em] h-14 rounded-xl shadow-lg shadow-teal-500/20 transition-all group"
                            disabled={loading}
                        >
                            {loading ? "Initializing..." : "Register Account"}
                        </Button>
                        <div className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Already have an account?{" "}
                            <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
                                Login Here
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
