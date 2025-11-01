"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import ContractorSidebar from "@/app/contractor/components/ContractorSidebar";


export default function ContractorDashboard() {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) {
			router.push("/contractor/login");
		}
	}, []);

	return (
		<ContractorSidebar/>
	);
}
