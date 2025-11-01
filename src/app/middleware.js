import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req) {
	const token = req.headers.get("authorization")?.replace("Bearer ", "");
	const pathname = req.nextUrl.pathname;

	// ----------- ROLE PROTECTED ROUTES -----------
	const protectedRoutes = [
		{ prefix: "/admin/dashboard", role: "admin", redirect: "/admin/login" },
		{ prefix: "/client/dashboard", role: "client", redirect: "/client/login" },
		{ prefix: "/contractor/dashboard", role: "contractor", redirect: "/contractor/login" },
	];

	for (const route of protectedRoutes) {
		if (pathname.startsWith(route.prefix)) {
			if (!token) {
				return NextResponse.redirect(new URL(route.redirect, req.url));
			}

			try {
				const decoded = verifyToken(token);

				// Check user role
				if (decoded.role !== route.role) {
					return NextResponse.redirect(new URL(route.redirect, req.url));
				}
			} catch {
				return NextResponse.redirect(new URL(route.redirect, req.url));
			}
		}
	}

	return NextResponse.next();
}

// ✅ Apply middleware only to dashboard routes
export const config = {
	matcher: [
		"/admin/dashboard/:path*",
		"/client/dashboard/:path*",
		"/contractor/dashboard/:path*",
	],
};
