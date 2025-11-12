"use client";

import AllPages from "@/app/client/components/AllPages";
import {
	Home,
	CheckCircle,
	FolderOpen,
	MessageSquare,
	CreditCard, CircleUser, PencilRuler,
} from "lucide-react";
import SidebarPage from "@/components/SidebarPage";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function ClientSidebar() {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) router.push("/client/login");
	}, [router]);

	const menuItems = [
		{ title: "Home", icon: Home },
		{ title: "Project", icon: CheckCircle },
		{ title: "Drawing", icon: PencilRuler},
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
