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
	ChartBarIncreasing, BrickWall, PencilRuler, IndianRupee
} from "lucide-react";
import SidebarPage from "@/components/SidebarPage";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function ContractorSidebar() {

	const router = useRouter();
	const [unreadQueriesCount, setUnreadQueriesCount] = useState(0);

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) router.push("/contractor/login");
	}, [router]);

	useEffect(() => {
		const fetchUnreadQueries = async () => {
			const token = sessionStorage.getItem("token");
			if (!token) return;

			try {
				const res = await fetch("/api/contractors/queries", {
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
		{title: "Home", icon: Home},
		{title: "Project", icon: HousePlus},
		{title: "Drawing", icon: PencilRuler},
		{title: "Stage", icon: ChartBarIncreasing},
		{title: "Material", icon: BrickWall},
		{title: "Payment", icon: IndianRupee},
		{title: "Query", icon: MessageSquare, badge: unreadQueriesCount},
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
