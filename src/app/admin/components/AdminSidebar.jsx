"use client";

import SidebarPage from "@/components/SidebarPage";
import AllPages from "@/app/admin/components/AllPages";
import {Home, Users, HousePlus, HardHat, UserRound, CircleUser} from "lucide-react";

export default function AdminDashboard() {
	const menuItems = [
		{ title: "Home", icon: Home },
		{ title: "Users", icon: Users },
		{ title: "Project", icon: HousePlus },
		{ title: "Stage", icon: HardHat },
		{ title: "Profile", icon: CircleUser}
	];

	return (
		<SidebarPage
			role="admin"
			menuItems={menuItems}
			contentComponent={AllPages}
		/>
	);
}
