"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function LoginPage() {
    const { status } = useSession();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password. Or your account is not yet active.");
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-teal-400">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign in to manage your pharmacy inventory.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
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
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                        <div className="text-center text-sm text-slate-400">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-teal-400 hover:underline hover:text-teal-300">
                                Register Pharmacy
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
