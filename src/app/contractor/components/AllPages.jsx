"use client";

import HomePage from "@/app/contractor/components/Pages/Home";
import ContractorStagesPage from "@/app/contractor/components/Pages/Stage";
import ProfilePage from "@/app/contractor/components/Pages/Profile";

export default function AllPages({activePage}) {
	switch (activePage) {
		case "Home":
			return <HomePage/>;
		case "Stage":
			return <ContractorStagesPage/>;
		case "Profile":
			return <ProfilePage/>
		default:
			return (<div className="p-4">
				<h2 className="text-xl font-semibold">Page Not Found</h2>
			</div>);
	}
}
