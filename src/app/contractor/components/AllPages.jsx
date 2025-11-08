"use client";

import HomePage from "@/app/contractor/components/Pages/Home";
import ContractorStagesPage from "@/app/contractor/components/Pages/Stage";
import ProfilePage from "@/app/contractor/components/Pages/Profile";
import ProjectPage from "@/app/contractor/components/Pages/Project";
import MaterialPage from "@/app/contractor/components/Pages/Material";
import ContractorQueriesPage from "@/app/contractor/components/Pages/Query";

export default function AllPages({activePage}) {
	switch (activePage) {
		case "Home":
			return <HomePage/>;
		case "Project":
			return <ProjectPage/>;
		case "Stage":
			return <ContractorStagesPage/>;
		case "Material":
			return <MaterialPage/>
		case "Profile":
			return <ProfilePage/>
		case "Query":
			return <ContractorQueriesPage/>
		default:
			return (<div className="p-4">
				<h2 className="text-xl font-semibold">Page Not Found</h2>
			</div>);
	}
}
