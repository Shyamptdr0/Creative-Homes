"use client";

import HomePage from "@/app/client/components/Pages/Home";
import ClientStagesPage from "@/app/client/components/Pages/Project";
import ProfilePage from "@/app/client/components/Pages/Profile";
import ClientDrawingsPage from "@/app/client/components/Pages/Drawing";
import ClientPaymentsPage from "@/app/client/components/Pages/Payments";
import ClientQueriesPage from "@/app/client/components/Pages/Query";


export default function AllPages({activePage}) {
	switch (activePage) {
		case "Home":
			return <HomePage/>;
		case "Project":
			return <ClientStagesPage/>
		case "Profile":
			return <ProfilePage/>
		case "Drawing":
			return <ClientDrawingsPage/>
		case "Payments":
			return <ClientPaymentsPage/>
		case "Queries":
			return <ClientQueriesPage/>
		default:
			return (<div className="p-4">
				<h2 className="text-xl font-semibold">Page Not Found</h2>
			</div>);
	}
}
