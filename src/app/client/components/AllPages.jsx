"use client";

import HomePage from "@/app/client/components/Pages/Home";
import ClientStagesPage from "@/app/client/components/Pages/Project";
import ProfilePage from "@/app/client/components/Pages/Profile";


export default function AllPages({activePage}) {
	switch (activePage) {
		case "Home":
			return <HomePage/>;
		case "Project":
			return <ClientStagesPage/>
		case "Profile":
			return <ProfilePage/>
		default:
			return (<div className="p-4">
				<h2 className="text-xl font-semibold">Page Not Found</h2>
			</div>);
	}
}
