"use client";

import AllPages from "@/app/contractor/components/AllPages";
import {
	Home,
	ClipboardList,
	Upload,
	MessageSquare,
	PersonStanding,
	CircleUser,
	HousePlus,
	ChartBarIncreasing, BrickWall
} from "lucide-react";
import SidebarPage from "@/components/SidebarPage";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function ContractorSidebar() {

	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) router.push("/contractor/login");
	}, [router]);


	const menuItems = [
		{title: "Home", icon: Home},
		{title: "Project", icon: HousePlus},
		{title: "Stage", icon: ChartBarIncreasing},
		{title: "Material", icon: BrickWall},
		{title: "Query", icon: MessageSquare},
		{title: "Profile", icon: CircleUser }
	];

	return (
		<SidebarPage
			role="contractor"
			menuItems={menuItems}
			contentComponent={AllPages}
		/>
	);
}
