"use client";

import AllPages from "@/app/contractor/components/AllPages";
import {Home, ClipboardList, Upload, MessageSquare, PersonStanding, CircleUser} from "lucide-react";
import SidebarPage from "@/components/SidebarPage";

export default function ContractorSidebar() {
	const menuItems = [
		{title: "Home", icon: Home},
		{title: "Stage", icon: ClipboardList},
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
