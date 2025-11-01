"use client";

import AllPages from "@/app/client/components/AllPages";
import {
	Home,
	CheckCircle,
	FolderOpen,
	MessageSquare,
	CreditCard, CircleUser,
} from "lucide-react";
import SidebarPage from "@/components/SidebarPage";

export default function ClientSidebar() {
	const menuItems = [
		{ title: "Home", icon: Home },
		{ title: "Project Progress", icon: CheckCircle },
		{ title: "Documents", icon: FolderOpen },
		{ title: "Queries", icon: MessageSquare },
		{ title: "Payments", icon: CreditCard },
		{ title: "Profile", icon: CircleUser}
	];

	return (
		<SidebarPage
			role="client"
			menuItems={menuItems}
			contentComponent={AllPages}
		/>
	);
}
