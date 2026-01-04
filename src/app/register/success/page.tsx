import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterSuccessPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-2xl text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-teal-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-teal-400">
                        Registration Received!
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                        Your application is now being reviewed by our team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-300">
                    <p>
                        We will review your pharmacy license and details manually. This typically takes 24-48 hours.
                    </p>
                    <p>
                        Once approved, you will receive an email and be able to access your dashboard.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
                        <Link href="/">Return to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
