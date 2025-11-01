"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		const user = JSON.parse(sessionStorage.getItem("user") || "{}");

		if (!token) {
			router.push("/Login");
			return;
		}

		if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
			alert("Access denied!");
			if (user.role === "admin") router.push("/admin/login");
			else router.push("/Login");
		}
	}, [router, allowedRoles]);

	return <>{children}</>;
}
