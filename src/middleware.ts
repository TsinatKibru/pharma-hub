import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");
        const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

        if (isAdminPage && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (isDashboardPage && token?.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin", req.url));
        }

        if (isDashboardPage && token?.role === "PATIENT") {
            return NextResponse.redirect(new URL("/search", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
