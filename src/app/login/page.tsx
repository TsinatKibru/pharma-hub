"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

function LoginContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            handleRedirect(session.user.role);
        }
    }, [status, session, router]);

    const handleRedirect = (role?: string) => {
        let targetUrl = "/dashboard";
        if (role === "ADMIN") {
            targetUrl = "/admin";
        } else if (role === "PATIENT") {
            targetUrl = "/search";
        }

        window.location.href = targetUrl;
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password. Or your account is not yet active.");
                setLoading(false);
            } else {
                // Fetch session immediately to get the role
                const newSession = await getSession();
                if (newSession?.user) {
                    handleRedirect(newSession.user.role as string);
                } else {
                    // Fallback to dashboard with hard redirect
                    window.location.href = "/dashboard";
                }
            }
        } catch (err) {
            console.error("Login detail error:", err);
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-[#0c1120] text-slate-100 shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-blue-600" />
                <CardHeader className="space-y-1 p-8">
                    <CardTitle className="text-2xl font-black tracking-tight text-white uppercase">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-medium italic">
                        Sign in to access your PharmaHub account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {isRegistered && (
                            <Alert className="bg-teal-500/10 border-teal-500/20 text-teal-400 rounded-xl">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription className="font-bold text-xs uppercase tracking-widest ml-2">Registration successful! Please sign in.</AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                className="bg-slate-800 border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-slate-800 border-slate-700 focus:border-teal-500 focus:ring-teal-500"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-6">
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                        <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
                            <div className="flex items-center gap-4">
                                <Link href="/register" className="text-teal-400 hover:underline hover:text-teal-300">
                                    Register Pharmacy
                                </Link>
                                <span className="text-slate-700">|</span>
                                <Link href="/register/customer" className="text-blue-400 hover:underline hover:text-blue-300">
                                    Patient Sign Up
                                </Link>
                            </div>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
