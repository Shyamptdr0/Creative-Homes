"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import AdminSidebar from "@/app/admin/components/AdminSidebar";


export default function AdminDashboard() {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) {
			router.push("/admin/login");
		}
	}, []);

	return (
				<AdminSidebar/>
	);
}
