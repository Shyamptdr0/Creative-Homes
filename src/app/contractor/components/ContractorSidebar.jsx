"use client";

import AllPages from "@/app/contractor/components/AllPages";
import {Home, ClipboardList, Upload, MessageSquare, PersonStanding, CircleUser} from "lucide-react";
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
		{title: "Project", icon: ClipboardList},
		{title: "Stage", icon: ClipboardList},
		{title: "Material", icon: ClipboardList},
		{title: "Uploads", icon: Upload},
		{title: "Messages", icon: MessageSquare},
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
