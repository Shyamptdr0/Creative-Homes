"use client";

import { useEffect, useState } from "react";
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
	IndianRupee, PencilRuler, MessageCircle
} from "lucide-react";
import {DEFAULT_RUNTIME_WEBPACK} from "next/constants";

export default function AdminDashboard() {
	const router = useRouter();
	const [unreadQueriesCount, setUnreadQueriesCount] = useState(0);

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) router.push("/admin/login");
	}, [router]);

	useEffect(() => {
		const fetchUnreadQueries = async () => {
			const token = sessionStorage.getItem("token");
			if (!token) return;

			try {
				const res = await fetch("/api/queries", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				if (data.success && Array.isArray(data.queries)) {
					// Count only open issues (not in-progress or resolved)
					const openIssues = data.queries.filter(query => query.status === 'open').length;
					setUnreadQueriesCount(openIssues);
				}
			} catch (error) {
				console.error("Error fetching unread queries:", error);
			}
		};

		fetchUnreadQueries();
		// Set up polling for real-time updates
		const interval = setInterval(fetchUnreadQueries, 30000); // Check every 30 seconds

		return () => clearInterval(interval);
	}, []);

	const menuItems = [
		{ title: "Home", icon: Home },
		{ title: "Users", icon: Users },
		{ title: "Project", icon: HousePlus },
		{ title: "Drawing", icon: PencilRuler},
		{ title: "Stage", icon: ChartBarIncreasing },
		{ title: "Material", icon: BrickWall},
		{ title: "Payments" ,icon: IndianRupee},
		{ title: "Query", icon: MessageCircle, badge: unreadQueriesCount},
		// { title: "Profile", icon: CircleUser }
	];

	return (
		<SidebarPage
			role="admin"
			menuItems={menuItems}
			contentComponent={AllPages}
		/>
	);
}
