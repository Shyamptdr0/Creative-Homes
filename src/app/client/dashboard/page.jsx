"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import ClientSidebar from "@/app/client/components/ClientSidebar";


export default function ClientDashboard() {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) {
			router.push("/client/login");
		}
	}, []);

	return (
		<ClientSidebar/>
	);
}
