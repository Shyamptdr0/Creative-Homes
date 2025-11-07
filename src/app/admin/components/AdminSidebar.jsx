"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarPage from "@/components/SidebarPage";
import AllPages from "@/app/admin/components/AllPages";
import {
	Home,
	Users,
	HousePlus,
	HardHat,
	CircleUser,
	BrickWall,
	Stars,
	ChartBarIncreasing,
	IndianRupee, PencilRuler
} from "lucide-react";
import {DEFAULT_RUNTIME_WEBPACK} from "next/constants";

export default function AdminDashboard() {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) router.push("/admin/login");
	}, [router]);

	const menuItems = [
		{ title: "Home", icon: Home },
		{ title: "Users", icon: Users },
		{ title: "Project", icon: HousePlus },
		{ title: "Drawing", icon: PencilRuler},
		{ title: "Stage", icon: ChartBarIncreasing },
		{ title: "Material", icon: BrickWall},
		{ title: "Payments" ,icon: IndianRupee},
		{ title: "Profile", icon: CircleUser }
	];

	return (
		<SidebarPage
			role="admin"
			menuItems={menuItems}
			contentComponent={AllPages}
		/>
	);
}
